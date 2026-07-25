// resources/static/app/ui/salary-ticker.js
// 상단바에 항상 떠 있는 실시간 급여 카운터.
// 이번 달 "월급"(INCOME) 항목과 마이페이지의 근무 스케줄을 기반으로
// 근무 요일/시간에만 초 단위로 금액이 올라간다.

import authStore from '../store/authStore.js';

let intervalId = null;

function makeIsWorkDay(workDays) {
    const DAY_MAP = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return (date) => workDays.includes(DAY_MAP[date.getDay()]);
}

export function stopTopbarSalaryTicker() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    const el = document.getElementById("topbar-salary-ticker");
    if (el) el.innerHTML = "";
    const gauge = document.getElementById("topbar-gauge");
    if (gauge) gauge.style.width = "0%";
    const expenseGauge = document.getElementById("topbar-gauge-expense");
    if (expenseGauge) expenseGauge.style.width = "0%";
}

export async function initTopbarSalaryTicker() {
    stopTopbarSalaryTicker();

    const el = document.getElementById("topbar-salary-ticker");
    if (!el || !authStore.isLoggedIn()) return;

    const now = new Date();
    let transactions, schedule;
    try {
        const [txRes, scheduleRes] = await Promise.all([
            axios.get("/api/money/ledger", { params: { year: now.getFullYear(), month: now.getMonth() + 1 } }),
            axios.get("/api/auth/work-schedule")
        ]);
        transactions = txRes.data;
        schedule = scheduleRes.data;
    } catch (e) {
        return; // 실패하면 조용히 숨김 (topbar를 방해하지 않도록)
    }

    const salaryTx = transactions.find(tx => tx.type === "INCOME" && tx.category === "월급");
    if (!salaryTx) return; // 이번 달 월급이 없으면 표시 안 함

    const salaryAmount = Number(salaryTx.amount);
    // 월급 외 수입/지출은 시간에 걸쳐 쌓이는 게 아니라 등록하는 즉시 게이지에 반영된다.
    const otherIncomeAmount = transactions
        .filter(tx => tx.type === "INCOME" && tx.category !== "월급")
        .reduce((sum, tx) => sum + Number(tx.amount), 0);
    const expenseAmount = transactions
        .filter(tx => tx.type === "EXPENSE")
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const workDays = (schedule.workDays || "MON,TUE,WED,THU,FRI").split(",");
    const [wsH, wsM] = (schedule.workStartTime || "09:00:00").split(":").map(Number);
    const [weH, weM] = (schedule.workEndTime || "18:00:00").split(":").map(Number);
    const isWorkDay = makeIsWorkDay(workDays);

    const daySeconds = (date) => {
        if (!isWorkDay(date)) return 0;
        return Math.max(0, (weH * 3600 + weM * 60) - (wsH * 3600 + wsM * 60));
    };

    // 게이지는 월급날이 아니라 달력 기준(1일~말일)으로 리셋된다.
    const periodBounds = (refDate) => {
        const start = new Date(refDate.getFullYear(), refDate.getMonth(), 1, 0, 0, 0);
        const end = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1, 0, 0, 0);
        return { start, end };
    };

    const totalWorkSeconds = (periodStart, periodEnd) => {
        let total = 0;
        const cursor = new Date(periodStart);
        cursor.setHours(0, 0, 0, 0);
        const endDay = new Date(periodEnd);
        endDay.setHours(0, 0, 0, 0);
        while (cursor < endDay) {
            total += daySeconds(cursor);
            cursor.setDate(cursor.getDate() + 1);
        }
        return total;
    };

    const elapsedWorkSeconds = (periodStart, nowTick) => {
        let total = 0;
        const cursor = new Date(periodStart);
        cursor.setHours(0, 0, 0, 0);
        const today = new Date(nowTick);
        today.setHours(0, 0, 0, 0);
        while (cursor < today) {
            total += daySeconds(cursor);
            cursor.setDate(cursor.getDate() + 1);
        }
        if (isWorkDay(nowTick)) {
            const startOfWork = new Date(nowTick.getFullYear(), nowTick.getMonth(), nowTick.getDate(), wsH, wsM, 0);
            const endOfWork = new Date(nowTick.getFullYear(), nowTick.getMonth(), nowTick.getDate(), weH, weM, 0);
            if (nowTick >= startOfWork) {
                const clamped = nowTick < endOfWork ? nowTick : endOfWork;
                total += (clamped - startOfWork) / 1000;
            }
        }
        return total;
    };

    el.innerHTML = `
        <span class="topbar-salary-dot" id="topbarSalaryDot"></span>
        <span id="topbarSalaryAmount"></span>
    `;

    const tick = () => {
        const amountEl = document.getElementById("topbarSalaryAmount");
        if (!amountEl) {
            clearInterval(intervalId);
            intervalId = null;
            return;
        }
        const nowTick = new Date();
        const { start, end } = periodBounds(nowTick);
        const total = totalWorkSeconds(start, end);
        const elapsed = Math.min(elapsedWorkSeconds(start, nowTick), total);
        const accruedSalary = total > 0 ? Math.floor(salaryAmount * (elapsed / total)) : 0;
        const earned = accruedSalary + otherIncomeAmount;

        const todayIsWorkDay = isWorkDay(nowTick);
        const startOfWork = new Date(nowTick.getFullYear(), nowTick.getMonth(), nowTick.getDate(), wsH, wsM, 0);
        const endOfWork = new Date(nowTick.getFullYear(), nowTick.getMonth(), nowTick.getDate(), weH, weM, 0);
        const workingNow = todayIsWorkDay && nowTick >= startOfWork && nowTick < endOfWork;

        amountEl.textContent = `💰 ${earned.toLocaleString("ko-KR")}원`;
        const dot = document.getElementById("topbarSalaryDot");
        if (dot) {
            dot.classList.toggle("is-working", workingNow);
            dot.title = workingNow ? "근무 중" : (todayIsWorkDay ? "근무 시간 아님" : "휴무일");
        }

        const gauge = document.getElementById("topbar-gauge");
        if (gauge) {
            const percent = Math.min(100, (earned / salaryAmount) * 100);
            gauge.style.width = `${percent}%`;
        }

        const expenseGauge = document.getElementById("topbar-gauge-expense");
        if (expenseGauge) {
            const expensePercent = Math.min(100, (expenseAmount / salaryAmount) * 100);
            expenseGauge.style.width = `${expensePercent}%`;
        }
    };

    tick();
    intervalId = setInterval(tick, 1000);
}
