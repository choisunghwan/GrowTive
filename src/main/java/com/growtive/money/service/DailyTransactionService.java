package com.growtive.money.service;

import com.growtive.money.dto.DailyTransactionDto;

import java.util.List;

public interface DailyTransactionService {

    List<DailyTransactionDto> getMonthlyTransactions(Long userId, int year, int month);

    DailyTransactionDto create(Long userId, DailyTransactionDto dto);

    DailyTransactionDto update(Long userId, Long id, DailyTransactionDto dto);

    void delete(Long userId, Long id);
}
