document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const errorMessage = document.getElementById('errorMessage');
    
    // Toggle elements
    const searchBySeat = document.getElementById('searchBySeat');
    const searchByName = document.getElementById('searchByName');
    // Set initial loading state
    searchBtn.disabled = true;
    searchInput.disabled = true;
    searchInput.placeholder = "جاري تحميل 700 ألف نتيجة... يرجى الانتظار";
    
    let studentsData = [];

    // Fetch and decompress data
    fetch('data.json.gz')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
        })
        .then(buffer => {
            // Decompress the gzip buffer using pako
            const decompressed = pako.inflate(buffer, { to: 'string' });
            studentsData = JSON.parse(decompressed);
            console.log('Data loaded successfully:', studentsData.length, 'records');
            
            // Enable UI after loading
            searchBtn.disabled = false;
            searchInput.disabled = false;
            updatePlaceholder(); // Reset placeholder to correct text
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <h3>خطأ في النظام</h3>
                    <p>تعذر تحميل بيانات النتائج. يرجى المحاولة لاحقاً.</p>
                </div>
            `;
            resultsContainer.classList.remove('hidden');
        });

    // Update placeholder based on selected toggle
    const updatePlaceholder = () => {
        if (searchInput.disabled) return; // Do not update if still loading
        
        if (searchBySeat.checked) {
            searchInput.placeholder = "أدخل رقم الجلوس هنا...";
        } else {
            searchInput.placeholder = "أدخل اسم الطالب هنا...";
        }
        searchInput.focus();
    };

    searchBySeat.addEventListener('change', updatePlaceholder);
    searchByName.addEventListener('change', updatePlaceholder);

    const calculatePercentage = (degree) => {
        const percentage = (parseFloat(degree) / 320) * 100;
        return percentage.toFixed(2) + '%';
    };

    const displayResults = (results) => {
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <h3>لا توجد نتائج</h3>
                    <p>عفواً، لم نتمكن من العثور على نتيجة مطابقة لبحثك.</p>
                </div>
            `;
        } else {
            // Limit results to 50 if searching by name to prevent browser crash
            const displayLimit = 50;
            const limitedResults = results.slice(0, displayLimit);
            
            limitedResults.forEach(student => {
                const card = document.createElement('div');
                card.className = 'result-card';
                
                card.innerHTML = `
                    <div class="result-header">
                        <h2 class="student-name">${student[1]}</h2>
                        <div class="seat-number">
                            رقم الجلوس: ${student[0]}
                        </div>
                    </div>
                    <div class="result-details">
                        <div class="detail-item">
                            <span class="detail-label">المجموع الكلي</span>
                            <span class="detail-value">${student[2]} / 320</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">النسبة المئوية</span>
                            <span class="detail-value">${calculatePercentage(student[2])}</span>
                        </div>
                    </div>
                    <div class="status-badge">
                        ${student[3]}
                    </div>
                `;
                resultsContainer.appendChild(card);
            });
            
            if (results.length > displayLimit) {
                const notice = document.createElement('div');
                notice.className = 'error-message';
                notice.style.marginTop = '1rem';
                notice.textContent = `تم عرض أول ${displayLimit} نتيجة فقط. يرجى كتابة الاسم بشكل أدق.`;
                resultsContainer.appendChild(notice);
            }
        }
        
        resultsContainer.classList.remove('hidden');
    };

    const handleSearch = () => {
        const query = searchInput.value.trim();
        
        if (query === '') {
            errorMessage.classList.remove('hidden');
            resultsContainer.classList.add('hidden');
            return;
        }
        
        errorMessage.classList.add('hidden');
        
        const isSearchBySeat = searchBySeat.checked;
        
        const results = studentsData.filter(student => {
            if (isSearchBySeat) {
                return student[0] && student[0].toString() === query;
            } else {
                return student[1] && student[1].toString().includes(query);
            }
        });
        
        displayResults(results);
    };

    searchBtn.addEventListener('click', handleSearch);
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
});
