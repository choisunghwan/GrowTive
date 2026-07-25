export default function DashboardPage() {
    const now = new Date();

    return {
        title: "돈 흐름",

        state: {
            year: now.getFullYear(),
            month: now.getMonth() + 1
        },

        render() {
            return `
        <section class="dashboard">

          <div class="card">
            <h1 class="title">돈 흐름</h1>
            <p class="subtitle">이번 달 돈이 어디로 흘러가는지 확인하세요</p>

            <div style="display:flex; align-items:center; gap:10px; margin-top:16px; flex-wrap:wrap;">
              <button id="prevMonthBtn" type="button">◀ 이전 달</button>
              <div id="currentMonthLabel" style="font-weight:700; font-size:16px;"></div>
              <button id="nextMonthBtn" type="button">다음 달 ▶</button>
              <button id="goCurrentMonthBtn" type="button">현재 월로</button>
            </div>
          </div>

          <!-- ⏱️ 실시간 급여 카운터 -->
          <div class="card" style="margin-top:20px;">
            <h3>⏱️ 실시간 급여 카운터</h3>
            <div style="font-size:13px; opacity:0.75; margin-top:6px;">
              이번 달 등록된 월급을 근무 시간에 맞춰 초 단위로 쌓아 보여줍니다. (마이페이지에서 근무 시간을 설정하세요)
            </div>
            <div id="salaryTickerCard" style="margin-top:14px;"></div>
          </div>

          <!-- 🔥 월급 흐름 -->
          <div class="card" style="margin-top:20px;">
            <h3>월급 흐름</h3>
            <div style="font-size:13px; opacity:0.75; margin-top:6px;">
              가계부에 기록한 수입/지출을 기반으로 이번 달 돈의 흐름을 보여줍니다.
            </div>
            <div class="chart-wrapper sankey-scroll" style="margin-top:12px;">
              <div class="sankey-scroll-inner">
                <canvas id="sankeyChart"></canvas>
              </div>
            </div>
            <div id="remainingInfo" style="margin-top:10px;"></div>
          </div>

          <!-- 💰 요약 -->
          <div class="card" style="margin-top:20px;">
            <h3>재무 요약</h3>
            <div style="font-size:13px; opacity:0.75; margin-top:6px;">
              이번 달 수입/지출 요약입니다.
            </div>
            <div id="moneySummary" class="money-summary-grid"></div>
          </div>

        </section>
      `;
        },

        async onMounted() {
            if (!window.Chart) {
                const script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.1";
                document.body.appendChild(script);
                await new Promise(resolve => script.onload = resolve);
            }

            if (!window.SankeyController) {
                const sankeyScript = document.createElement("script");
                sankeyScript.src = "https://cdn.jsdelivr.net/npm/chartjs-chart-sankey@0.12.0/dist/chartjs-chart-sankey.min.js";
                document.body.appendChild(sankeyScript);
                await new Promise(resolve => sankeyScript.onload = resolve);
            }

            this.bindMonthButtons();
            this.renderMonthLabel();

            await this.refreshAll();
            await this.initSalaryTicker();
        },

        /* ---------------- 실시간 급여 카운터 ---------------- */

        async initSalaryTicker() {
            if (window.__salaryTickerInterval) {
                clearInterval(window.__salaryTickerInterval);
                window.__salaryTickerInterval = null;
            }

            const el = document.getElementById("salaryTickerCard");
            if (!el) return;

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
                el.innerHTML = `<div class="hint">급여 정보를 불러오지 못했습니다.</div>`;
                return;
            }

            const salaryTx = transactions.find(tx => tx.type === "INCOME" && tx.category === "월급");
            if (!salaryTx) {
                el.innerHTML = `<div class="hint">이번 달에 등록된 "월급" 항목이 없어요. 가계부에서 "매달 반복"으로 월급을 등록하면 여기서 실시간으로 보여줍니다.</div>`;
                return;
            }

            const salaryAmount = Number(salaryTx.amount);
            const payDay = Number(salaryTx.date.split("-")[2]);
            const workDays = (schedule.workDays || "MON,TUE,WED,THU,FRI").split(",");
            const [wsH, wsM] = (schedule.workStartTime || "09:00:00").split(":").map(Number);
            const [weH, weM] = (schedule.workEndTime || "18:00:00").split(":").map(Number);
            const DAY_MAP = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

            const isWorkDay = (date) => workDays.includes(DAY_MAP[date.getDay()]);
            const daySeconds = (date) => {
                if (!isWorkDay(date)) return 0;
                return Math.max(0, (weH * 3600 + weM * 60) - (wsH * 3600 + wsM * 60));
            };

            const periodBounds = (refDate) => {
                let start = new Date(refDate.getFullYear(), refDate.getMonth(), payDay, 0, 0, 0);
                if (start > refDate) {
                    start = new Date(refDate.getFullYear(), refDate.getMonth() - 1, payDay, 0, 0, 0);
                }
                const end = new Date(start.getFullYear(), start.getMonth() + 1, payDay, 0, 0, 0);
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
                <div style="text-align:center;">
                    <div id="salaryTickerClock" style="font-size:13px; color:var(--text-muted);"></div>
                    <div id="salaryTickerAmount" style="font-size:34px; font-weight:800; color:var(--brand); margin:6px 0;"></div>
                    <div id="salaryTickerStatus" style="font-size:13px;"></div>
                </div>
            `;

            const tick = () => {
                const amountEl = document.getElementById("salaryTickerAmount");
                if (!amountEl) {
                    clearInterval(window.__salaryTickerInterval);
                    return;
                }
                const nowTick = new Date();
                const { start, end } = periodBounds(nowTick);
                const total = totalWorkSeconds(start, end);
                const elapsed = Math.min(elapsedWorkSeconds(start, nowTick), total);
                const earned = total > 0 ? Math.floor(salaryAmount * (elapsed / total)) : 0;

                const todayIsWorkDay = isWorkDay(nowTick);
                const startOfWork = new Date(nowTick.getFullYear(), nowTick.getMonth(), nowTick.getDate(), wsH, wsM, 0);
                const endOfWork = new Date(nowTick.getFullYear(), nowTick.getMonth(), nowTick.getDate(), weH, weM, 0);
                const workingNow = todayIsWorkDay && nowTick >= startOfWork && nowTick < endOfWork;

                amountEl.textContent = `${earned.toLocaleString("ko-KR")}원`;
                document.getElementById("salaryTickerStatus").textContent =
                    workingNow ? "🟢 근무 중" : (todayIsWorkDay ? "⚪ 근무 시간 아님" : "🌴 휴무일");
                document.getElementById("salaryTickerClock").textContent = nowTick.toLocaleTimeString("ko-KR");
            };

            tick();
            window.__salaryTickerInterval = setInterval(tick, 1000);
        },

        /* ---------------- 공통 ---------------- */

        getYearMonthText() {
            return `${this.state.year}년 ${String(this.state.month).padStart(2, "0")}월`;
        },

        renderMonthLabel() {
            const labelEl = document.getElementById("currentMonthLabel");
            if (labelEl) {
                labelEl.innerText = this.getYearMonthText();
            }
        },

        moveMonth(diff) {
            let { year, month } = this.state;

            month += diff;

            if (month <= 0) {
                month = 12;
                year -= 1;
            } else if (month >= 13) {
                month = 1;
                year += 1;
            }

            this.state.year = year;
            this.state.month = month;
            this.renderMonthLabel();
        },

        async refreshAll() {
            await this.loadSummary();
            await this.renderSankey();
        },

        bindMonthButtons() {
            const prevBtn = document.getElementById("prevMonthBtn");
            const nextBtn = document.getElementById("nextMonthBtn");
            const currentBtn = document.getElementById("goCurrentMonthBtn");

            if (prevBtn) {
                prevBtn.onclick = async () => {
                    this.moveMonth(-1);
                    await this.refreshAll();
                };
            }

            if (nextBtn) {
                nextBtn.onclick = async () => {
                    this.moveMonth(1);
                    await this.refreshAll();
                };
            }

            if (currentBtn) {
                currentBtn.onclick = async () => {
                    const now = new Date();
                    this.state.year = now.getFullYear();
                    this.state.month = now.getMonth() + 1;
                    this.renderMonthLabel();
                    await this.refreshAll();
                };
            }
        },

        /* ---------------- Sankey ---------------- */

        // 카테고리가 너무 많으면 라벨이 겹치므로, 각 쪽(수입/지출) 상위 5개만 남기고
        // 나머지는 "기타 수입"/"기타 지출"로 합쳐서 보여준다 (실제 합계 데이터는 그대로 유지).
        buildDisplayFlow(data) {
            const nodes = data.nodes || [];
            const links = data.links || [];
            const hub = nodes.find(n => n.name === "총수입");
            const remain = nodes.find(n => n.type === "REMAIN");

            if (!hub) {
                return { sankeyData: [], hubName: null, remainName: null, incomeNames: new Set(), expenseNames: new Set() };
            }

            const byId = new Map(nodes.map(n => [n.id, n]));
            const MAX_PER_SIDE = 3;

            const condense = (sideLinks, pickNodeId) => {
                const sorted = [...sideLinks].sort((a, b) => b.value - a.value);
                const kept = sorted.slice(0, MAX_PER_SIDE).map(l => ({
                    name: byId.get(pickNodeId(l))?.name || "기타",
                    value: l.value
                }));
                const restTotal = sorted.slice(MAX_PER_SIDE).reduce((sum, l) => sum + l.value, 0);
                return { kept, restTotal };
            };

            const incomeLinks = links.filter(l => l.target === hub.id);
            const expenseLinks = links.filter(l => l.source === hub.id && (!remain || l.target !== remain.id));
            const remainLink = remain ? links.find(l => l.target === remain.id) : null;

            const income = condense(incomeLinks, l => l.source);
            const expense = condense(expenseLinks, l => l.target);

            const incomeNames = new Set(income.kept.map(i => i.name));
            const expenseNames = new Set(expense.kept.map(i => i.name));

            const sankeyData = [];
            income.kept.forEach(i => sankeyData.push({ from: i.name, to: hub.name, flow: i.value }));
            if (income.restTotal > 0) {
                sankeyData.push({ from: "기타 수입", to: hub.name, flow: income.restTotal });
                incomeNames.add("기타 수입");
            }
            expense.kept.forEach(i => sankeyData.push({ from: hub.name, to: i.name, flow: i.value }));
            if (expense.restTotal > 0) {
                sankeyData.push({ from: hub.name, to: "기타 지출", flow: expense.restTotal });
                expenseNames.add("기타 지출");
            }
            if (remainLink && remain) {
                sankeyData.push({ from: hub.name, to: remain.name, flow: remainLink.value });
            }

            return { sankeyData, hubName: hub.name, remainName: remain ? remain.name : null, incomeNames, expenseNames };
        },

        colorForNode(name, ctx) {
            const isDark = document.documentElement.classList.contains("dark");
            if (name === ctx.hubName) return isDark ? "#3b82f6" : "#2563eb";
            if (name === ctx.remainName) return isDark ? "#2dd4bf" : "#0d9488";
            if (ctx.incomeNames.has(name)) return isDark ? "#22c55e" : "#16a34a";
            if (ctx.expenseNames.has(name)) return isDark ? "#fca5a5" : "#dc2626";
            return isDark ? "#94a3b8" : "#64748b";
        },

        async renderSankey() {
            const res = await fetch(`/api/money/flow?year=${this.state.year}&month=${this.state.month}`);
            if (!res.ok) {
                throw new Error(`flow 조회 실패: ${res.status}`);
            }

            const data = await res.json();
            const canvas = document.getElementById("sankeyChart");

            if (!canvas) return;

            if (window.__sankeyChart) {
                window.__sankeyChart.destroy();
            }

            const flow = this.buildDisplayFlow(data);
            const isDark = document.documentElement.classList.contains("dark");
            const labelColor = isDark ? "#e5e9f2" : "#1e2530";
            const fontStack = "'Pretendard Variable', Pretendard, -apple-system, 'Segoe UI', Roboto, 'Noto Sans KR', 'Malgun Gothic', sans-serif";
            const isMobile = window.innerWidth <= 480;
            const sankeyFontSize = isMobile ? 9 : 12;

            window.__sankeyChart = new Chart(canvas, {
                type: "sankey",
                data: {
                    datasets: [{
                        label: `${this.getYearMonthText()} 돈 흐름`,
                        data: flow.sankeyData,
                        colorFrom: c => this.colorForNode(c.raw.from, flow),
                        colorTo: c => this.colorForNode(c.raw.to, flow),
                        colorMode: "gradient",
                        borderWidth: 0,
                        nodeWidth: isMobile ? 8 : 14,
                        color: labelColor,
                        font: { family: fontStack, size: sankeyFontSize, weight: "600" }
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            enabled: true,
                            callbacks: {
                                label: ctx =>
                                    `${ctx.raw.from} → ${ctx.raw.to}: ${Number(ctx.raw.flow || 0).toLocaleString("ko-KR")}원`
                            }
                        }
                    }
                }
            });

            const remainingNode = (data.nodes || []).find(n => n.type === "REMAIN");
            const remainEl = document.getElementById("remainingInfo");

            if (remainEl) {
                if (remainingNode) {
                    remainEl.innerHTML =
                        `<div class="sankey-caption"><span class="dot"></span>${this.getYearMonthText()} 가용금 ${Number(remainingNode.monthlyAmount || 0).toLocaleString("ko-KR")}원</div>`;
                } else {
                    remainEl.innerHTML = `<div class="sankey-caption is-empty">${this.getYearMonthText()} 가용금 데이터가 없습니다.</div>`;
                }
            }
        },

        /* ---------------- 요약 ---------------- */

        async loadSummary() {
            const { year, month } = this.state;

            const res = await fetch(`/api/money/summary?year=${year}&month=${month}`);
            if (!res.ok) {
                throw new Error(`summary 조회 실패: ${res.status}`);
            }
            const summary = await res.json();

            const el = document.getElementById("moneySummary");
            if (!el) return;

            const won = n => Number(n || 0).toLocaleString("ko-KR") + "원";

            el.innerHTML = `
              <div class="money-stat money-stat--income">
                <div class="money-stat-label">총 수입</div>
                <div class="money-stat-value">${won(summary.totalIncome)}</div>
              </div>
              <div class="money-stat money-stat--expense">
                <div class="money-stat-label">총 지출</div>
                <div class="money-stat-value">${won(summary.totalExpense)}</div>
              </div>
              <div class="money-stat money-stat--remain">
                <div class="money-stat-label">잔액</div>
                <div class="money-stat-value">${won(summary.remaining)}</div>
              </div>
            `;
        }
    };
}
