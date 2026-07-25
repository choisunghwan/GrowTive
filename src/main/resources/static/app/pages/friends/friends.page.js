function emptyHint(text) {
    return `<div class="hint">${text}</div>`;
}

export default function FriendsPage() {
    return {
        title: '친구',

        render() {
            return `
            <section class="friend-page">
                <div class="card">
                    <h1 class="title">친구</h1>
                    <p class="subtitle">아이디 또는 이름으로 친구를 검색해서 추가해보세요.</p>
                    <form id="addFriendForm" class="form" style="margin-top:16px; max-width:420px;">
                        <input id="friendUsername" type="text" placeholder="아이디 또는 이름으로 검색" required>
                        <button type="submit" class="btn btn-primary">검색</button>
                    </form>
                    <div id="friendStatus" style="margin-top:8px; font-size:13px; color:var(--text-muted);"></div>
                    <div id="searchResults" style="margin-top:12px;"></div>
                </div>

                <div class="card" style="margin-top:20px;">
                    <h3>받은 요청</h3>
                    <div id="incomingList" style="margin-top:12px;"></div>
                </div>

                <div class="card" style="margin-top:20px;">
                    <h3>보낸 요청</h3>
                    <div id="outgoingList" style="margin-top:12px;"></div>
                </div>

                <div class="card" style="margin-top:20px;">
                    <h3>내 친구</h3>
                    <div id="friendsList" style="margin-top:12px;"></div>
                </div>
            </section>`;
        },

        async onMounted() {
            const $ = (id) => document.getElementById(id);

            function renderIncoming(list) {
                if (list.length === 0) {
                    $('incomingList').innerHTML = emptyHint('받은 요청이 없습니다.');
                    return;
                }
                $('incomingList').innerHTML = list.map(c => `
                    <div class="friend-item" data-id="${c.id}">
                        <span><b>${c.otherDisplayName}</b> <span class="hint">(${c.otherUsername})</span></span>
                        <span class="ledger-tx-actions">
                            <button class="btn btn-xs btn-primary" data-accept="${c.id}">수락</button>
                            <button class="btn btn-xs btn-danger" data-decline="${c.id}">거절</button>
                        </span>
                    </div>
                `).join('');

                $('incomingList').querySelectorAll('button[data-accept]').forEach(btn => {
                    btn.onclick = async () => {
                        try {
                            await axios.post(`/api/friends/requests/${btn.dataset.accept}/accept`);
                            await refresh();
                        } catch (e) {
                            alert(e.response?.data?.message || '수락에 실패했습니다.');
                        }
                    };
                });
                $('incomingList').querySelectorAll('button[data-decline]').forEach(btn => {
                    btn.onclick = async () => {
                        try {
                            await axios.delete(`/api/friends/${btn.dataset.decline}`);
                            await refresh();
                        } catch (e) {
                            alert(e.response?.data?.message || '거절에 실패했습니다.');
                        }
                    };
                });
            }

            function renderOutgoing(list) {
                if (list.length === 0) {
                    $('outgoingList').innerHTML = emptyHint('보낸 요청이 없습니다.');
                    return;
                }
                $('outgoingList').innerHTML = list.map(c => `
                    <div class="friend-item" data-id="${c.id}">
                        <span><b>${c.otherDisplayName}</b> <span class="hint">(${c.otherUsername})</span> · 응답 대기중</span>
                        <span class="ledger-tx-actions">
                            <button class="btn btn-xs btn-danger" data-cancel="${c.id}">취소</button>
                        </span>
                    </div>
                `).join('');

                $('outgoingList').querySelectorAll('button[data-cancel]').forEach(btn => {
                    btn.onclick = async () => {
                        try {
                            await axios.delete(`/api/friends/${btn.dataset.cancel}`);
                            await refresh();
                        } catch (e) {
                            alert(e.response?.data?.message || '취소에 실패했습니다.');
                        }
                    };
                });
            }

            function friendShareStatusText(c) {
                if (c.friendSharesFrom && c.friendSharesUntil) {
                    return `${c.otherDisplayName}님의 공유 기간: ${c.friendSharesFrom} ~ ${c.friendSharesUntil}`;
                }
                return `${c.otherDisplayName}님이 아직 공유 기간을 설정하지 않았습니다.`;
            }

            function renderFriends(list) {
                if (list.length === 0) {
                    $('friendsList').innerHTML = emptyHint('아직 친구가 없습니다.');
                    return;
                }
                $('friendsList').innerHTML = list.map(c => `
                    <div class="friend-item friend-item--stacked" data-id="${c.id}">
                        <div class="friend-item-row">
                            <span><b>${c.otherDisplayName}</b> <span class="hint">(${c.otherUsername})</span></span>
                            <span class="ledger-tx-actions">
                                ${c.comparisonAvailable
                                    ? `<a class="btn btn-xs btn-primary" href="#/compare?id=${c.id}">캘린더 비교</a>`
                                    : `<button class="btn btn-xs" disabled title="두 사람 모두 공유 기간을 설정해야 비교할 수 있습니다">캘린더 비교</button>`}
                            </span>
                        </div>
                        <div class="friend-item-row friend-share-row" style="flex-direction:column; align-items:stretch; gap:8px;">
                            <span class="hint">${friendShareStatusText(c)}</span>
                            <span class="friend-share-controls">
                                <span class="hint">내가 공유할 기간</span>
                                <input type="date" class="share-from-input" value="${c.mySharesFrom || ''}" data-id="${c.id}">
                                <span class="hint">~</span>
                                <input type="date" class="share-until-input" value="${c.mySharesUntil || ''}" data-id="${c.id}">
                                <button class="btn btn-xs" data-save-share="${c.id}">저장</button>
                                ${c.mySharesFrom ? `<button class="btn btn-xs btn-danger" data-clear-share="${c.id}">공유 취소</button>` : ''}
                            </span>
                        </div>
                        <div class="friend-item-row friend-unfriend-row">
                            <button class="btn btn-xs btn-ghost friend-unfriend-btn" data-unfriend="${c.id}">친구 해제</button>
                        </div>
                    </div>
                `).join('');

                $('friendsList').querySelectorAll('button[data-unfriend]').forEach(btn => {
                    btn.onclick = async () => {
                        if (!confirm('이 친구를 해제할까요? 공유 설정도 함께 사라집니다.')) return;
                        try {
                            await axios.delete(`/api/friends/${btn.dataset.unfriend}`);
                            await refresh();
                        } catch (e) {
                            alert(e.response?.data?.message || '친구 해제에 실패했습니다.');
                        }
                    };
                });

                $('friendsList').querySelectorAll('button[data-save-share]').forEach(btn => {
                    btn.onclick = async () => {
                        const id = btn.dataset.saveShare;
                        const fromInput = $('friendsList').querySelector(`input.share-from-input[data-id="${id}"]`);
                        const untilInput = $('friendsList').querySelector(`input.share-until-input[data-id="${id}"]`);
                        if (!fromInput.value || !untilInput.value) {
                            alert('공유 시작일과 종료일을 모두 입력해주세요.');
                            return;
                        }
                        try {
                            await axios.put(`/api/friends/${id}/shares-range`, {
                                sharesFrom: fromInput.value,
                                sharesUntil: untilInput.value
                            });
                            await refresh();
                        } catch (e) {
                            alert(e.response?.data?.message || '설정 저장에 실패했습니다.');
                        }
                    };
                });

                $('friendsList').querySelectorAll('button[data-clear-share]').forEach(btn => {
                    btn.onclick = async () => {
                        try {
                            await axios.put(`/api/friends/${btn.dataset.clearShare}/shares-range`, { sharesFrom: null, sharesUntil: null });
                            await refresh();
                        } catch (e) {
                            alert(e.response?.data?.message || '설정 저장에 실패했습니다.');
                        }
                    };
                });
            }

            async function refresh() {
                const [incoming, outgoing, friends] = await Promise.all([
                    axios.get('/api/friends/requests/incoming'),
                    axios.get('/api/friends/requests/outgoing'),
                    axios.get('/api/friends')
                ]);
                renderIncoming(incoming.data);
                renderOutgoing(outgoing.data);
                renderFriends(friends.data);
            }

            function renderSearchResults(list) {
                if (list.length === 0) {
                    $('searchResults').innerHTML = emptyHint('일치하는 사용자가 없습니다.');
                    return;
                }
                $('searchResults').innerHTML = list.map(u => `
                    <div class="friend-item" data-search-id="${u.id}">
                        <span><b>${u.displayName}</b> <span class="hint">(${u.username})</span></span>
                        <button class="btn btn-xs btn-primary" data-send="${u.username}">친구 요청 보내기</button>
                    </div>
                `).join('');

                $('searchResults').querySelectorAll('button[data-send]').forEach(btn => {
                    btn.onclick = async () => {
                        const username = btn.dataset.send;
                        const statusEl = $('friendStatus');
                        try {
                            statusEl.textContent = '요청 보내는 중...';
                            await axios.post('/api/friends/requests', { username });
                            statusEl.textContent = `"${username}"님에게 친구 요청을 보냈습니다.`;
                            $('searchResults').innerHTML = '';
                            $('friendUsername').value = '';
                            await refresh();
                        } catch (e) {
                            statusEl.textContent = '';
                            alert(e.response?.data?.message || '친구 요청에 실패했습니다.');
                        }
                    };
                });
            }

            $('addFriendForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const query = $('friendUsername').value.trim();
                if (!query) return;

                const statusEl = $('friendStatus');
                try {
                    statusEl.textContent = '검색 중...';
                    const res = await axios.get('/api/friends/search', { params: { q: query } });
                    statusEl.textContent = '';
                    renderSearchResults(res.data);
                } catch (e) {
                    statusEl.textContent = '';
                    alert(e.response?.data?.message || '검색에 실패했습니다.');
                }
            });

            await refresh();
        }
    };
}
