package com.growtive.money.service;

import com.growtive.money.dto.CategoryAmountDto;
import com.growtive.money.dto.FlowLinkDto;
import com.growtive.money.dto.FlowNodeDto;
import com.growtive.money.dto.FlowResponseDto;
import com.growtive.money.mapper.DailyTransactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FinancialFlowServiceImpl implements FinancialFlowService {

    private final DailyTransactionMapper dailyTransactionMapper;

    /**
     * 가계부(daily_transaction) 카테고리별 합계만으로 흐름도를 구성한다.
     * [수입 카테고리들] → 총수입 → [지출 카테고리들], 남으면 → 가용금(REMAIN)
     */
    @Override
    @Transactional(readOnly = true)
    public FlowResponseDto getMonthlyFlow(Long userId, int year, int month) {
        List<FlowNodeDto> nodes = new ArrayList<>();
        List<FlowLinkDto> links = new ArrayList<>();
        long nextId = 1;

        long hubId = nextId++;
        FlowNodeDto hubNode = new FlowNodeDto(hubId, "총수입", "INCOME", 0L);
        nodes.add(hubNode);

        long totalIncome = 0;
        for (CategoryAmountDto c : dailyTransactionMapper.sumByCategory(userId, year, month, "INCOME")) {
            if (c.getTotal() == null || c.getTotal() <= 0) continue;
            long id = nextId++;
            nodes.add(new FlowNodeDto(id, c.getCategory(), "INCOME", c.getTotal()));
            links.add(new FlowLinkDto(id, hubId, c.getTotal()));
            totalIncome += c.getTotal();
        }
        hubNode.setMonthlyAmount(totalIncome);

        long totalExpense = 0;
        for (CategoryAmountDto c : dailyTransactionMapper.sumByCategory(userId, year, month, "EXPENSE")) {
            if (c.getTotal() == null || c.getTotal() <= 0) continue;
            long id = nextId++;
            nodes.add(new FlowNodeDto(id, c.getCategory(), "EXPENSE", c.getTotal()));
            links.add(new FlowLinkDto(hubId, id, c.getTotal()));
            totalExpense += c.getTotal();
        }

        long remaining = totalIncome - totalExpense;
        if (remaining > 0) {
            long remainId = nextId++;
            nodes.add(new FlowNodeDto(remainId, "가용금", "REMAIN", remaining));
            links.add(new FlowLinkDto(hubId, remainId, remaining));
        }

        return new FlowResponseDto(nodes, links);
    }
}
