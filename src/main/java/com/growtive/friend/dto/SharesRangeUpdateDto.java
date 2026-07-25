package com.growtive.friend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class SharesRangeUpdateDto {

    private LocalDate sharesFrom;
    private LocalDate sharesUntil;
}
