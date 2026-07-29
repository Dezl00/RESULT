document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const errorMessage = document.getElementById('errorMessage');
    
    let studentsData = [];

    // Fetch data
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            studentsData = data;
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
            results.forEach(student => {
                const card = document.createElement('div');
                card.className = 'result-card';
                
                card.innerHTML = `
                    <div class="result-header">
                        <h2 class="student-name">${student.arabic_name}</h2>
                        <div class="seat-number">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            رقم الجلوس: ${student.seating_no}
                        </div>
                    </div>
                    <div class="result-details">
                        <div class="detail-item">
                            <span class="detail-label">المجموع الكلي</span>
                            <span class="detail-value">${student.total_degree} / 320</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">النسبة المئوية</span>
                            <span class="detail-value percentage-value">${calculatePercentage(student.total_degree)}</span>
                        </div>
                    </div>
                    <div class="status-badge">
                        ${student.student_case_desc}
                    </div>
                `;
                resultsContainer.appendChild(card);
            });
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
        
        // Check if query is a number (seating no) or text (name)
        const isNumeric = /^\d+$/.test(query);
        
        const results = studentsData.filter(student => {
            if (isNumeric) {
                return student.seating_no.toString() === query;
            } else {
                return student.arabic_name.includes(query);
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
