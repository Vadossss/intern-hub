package com.diplom.internhubbackend.migrations;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import liquibase.change.custom.CustomTaskChange;
import liquibase.database.Database;
import liquibase.database.jvm.JdbcConnection;
import liquibase.exception.CustomChangeException;
import liquibase.exception.SetupException;
import liquibase.exception.ValidationErrors;
import liquibase.resource.ResourceAccessor;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Types;

public class LoadRussianSettlementsChange implements CustomTaskChange {
    private static final int BATCH_SIZE = 500;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private ResourceAccessor resourceAccessor;
    private String filePath = "cities-data/russia-cities.json";
    private int loadedCount;

    public void setFilePath(String filePath) {
        if (filePath != null && !filePath.isBlank()) {
            this.filePath = filePath.trim();
        }
    }

    @Override
    public void execute(Database database) throws CustomChangeException {
        try (InputStream inputStream = resourceAccessor.getExisting(filePath).openInputStream()) {
            JsonNode root = objectMapper.readTree(inputStream);
            if (!root.isArray()) {
                throw new CustomChangeException("Russian settlements JSON must be an array");
            }

            Connection connection = ((JdbcConnection) database.getConnection()).getUnderlyingConnection();
            try (PreparedStatement statement = connection.prepareStatement(insertSql())) {
                int batchCount = 0;
                for (JsonNode settlement : root) {
                    bindSettlement(statement, settlement);
                    statement.addBatch();
                    batchCount++;
                    loadedCount++;

                    if (batchCount >= BATCH_SIZE) {
                        statement.executeBatch();
                        batchCount = 0;
                    }
                }

                if (batchCount > 0) {
                    statement.executeBatch();
                }
            }
        } catch (Exception ex) {
            throw new CustomChangeException("Failed to load Russian settlements from " + filePath, ex);
        }
    }

    private void bindSettlement(PreparedStatement statement, JsonNode settlement) throws SQLException {
        JsonNode region = settlement.path("region");

        setString(statement, 1, text(settlement, "name"));
        setString(statement, 2, text(settlement, "name_alt"));
        setString(statement, 3, text(settlement, "type"));
        setString(statement, 4, text(region, "name"));
        setString(statement, 5, text(region, "fullname"));
        setString(statement, 6, text(region, "typeShort"));
    }

    private String insertSql() {
        return """
                INSERT INTO city (
                    name,
                    name_alt,
                    type,
                    region_name,
                    region_fullname,
                    region_type_short,
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT (name, region_fullname) DO UPDATE SET
                    name = EXCLUDED.name,
                    name_alt = EXCLUDED.name_alt,
                    type = EXCLUDED.type,
                    region_name = EXCLUDED.region_name,
                    region_fullname = EXCLUDED.region_fullname,
                    region_type_short = EXCLUDED.region_type_short,
                    updated_at = CURRENT_TIMESTAMP
                """;
    }

    private String text(JsonNode node, String fieldName) {
        JsonNode value = node.path(fieldName);
        if (value.isMissingNode() || value.isNull()) {
            return null;
        }

        String text = value.asText();
        return text == null || text.isBlank() ? null : text;
    }

    private void setString(PreparedStatement statement, int index, String value) throws SQLException {
        if (value == null) {
            statement.setNull(index, Types.VARCHAR);
            return;
        }

        statement.setString(index, value);
    }

    @Override
    public String getConfirmationMessage() {
        return "Loaded " + loadedCount + " Russian settlements";
    }

    @Override
    public void setUp() throws SetupException {
    }

    @Override
    public void setFileOpener(ResourceAccessor resourceAccessor) {
        this.resourceAccessor = resourceAccessor;
    }

    @Override
    public ValidationErrors validate(Database database) {
        ValidationErrors errors = new ValidationErrors();
        if (resourceAccessor == null) {
            errors.addError("ResourceAccessor is required");
        }
        if (filePath == null || filePath.isBlank()) {
            errors.addError("filePath is required");
        }
        return errors;
    }
}
