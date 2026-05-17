package com.diplom.internhubbackend.dto.sj;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record SjVacancyItem(
        Long id,
        @JsonProperty("profession") String profession,
        String link,
        @JsonProperty("firm_name") String firmName,
        @JsonProperty("id_client") Long idClient,
        @JsonProperty("firm_activity") String firmActivity,
        @JsonProperty("client_logo") String clientLogo,
        SjTown town,
        String work,
        String candidat,
        String compensation,
        @JsonProperty("payment_from") Long paymentFrom,
        @JsonProperty("payment_to") Long paymentTo,
        String currency,
        SjNamedEntity experience,
        @JsonProperty("type_of_work") SjNamedEntity typeOfWork,
        @JsonProperty("place_of_work") SjNamedEntity placeOfWork,
        @JsonProperty("date_published") Long datePublished,
        @JsonProperty("date_pub_to") Long datePubTo,
        List<SjCatalogueItem> catalogues
) {
}
