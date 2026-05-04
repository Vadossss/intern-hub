package com.diplom.internhubbackend.dto.hh;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record HhNamedEntity(String id, String name) {}
