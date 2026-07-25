package com.growtive.money.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class DailyTransactionDto {

    private Long id;

    /**
     * 거래 날짜 (yyyy-MM-dd)
     */
    private LocalDate date;

    /**
     * INCOME / EXPENSE
     */
    private String type;

    /**
     * 식비 / 교통 / 카페 / 쇼핑 / 주거통신 / 의료 / 문화 / 기타
     */
    private String category;

    private Long amount;

    private String memo;

    /**
     * 매달 반복 여부. true인 원본 항목(recurringOriginId == null)은
     * 매월 조회 시 자동으로 그 달의 occurrence가 생성된다.
     */
    private boolean recurring;

    /**
     * 반복 원본(origin) row의 id. 이 값이 null이면 스스로가 원본이고,
     * 값이 있으면 그 원본으로부터 자동 생성된 occurrence다.
     */
    private Long recurringOriginId;

    /**
     * 친구와 캘린더 비교 시 이 항목을 숨길지 여부.
     */
    private boolean hidden;
}
