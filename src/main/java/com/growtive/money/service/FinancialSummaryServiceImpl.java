package com.growtive.money.service;

import com.growtive.money.dto.MoneySummaryDto;
import com.growtive.money.mapper.DailyTransactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FinancialSummaryServiceImpl implements FinancialSummaryService {

    private final DailyTransactionMapper dailyTransactionMapper;

    @Override
    @Transactional(readOnly = true)
    public MoneySummaryDto getMonthlySummary(Long userId, int year, int month) {
        long income = dailyTransactionMapper.sumByType(userId, year, month, "INCOME");
        long expense = dailyTransactionMapper.sumByType(userId, year, month, "EXPENSE");
        long remaining = income - expense;

        return new MoneySummaryDto(income, expense, remaining);
    }
}
