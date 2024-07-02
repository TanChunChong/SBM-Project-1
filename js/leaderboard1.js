function toggleTabs(tab) {
    const todayTab = document.getElementById('today-tab');
    const sevenDaysTab = document.getElementById('seven-days-tab');

    if (tab === 'today') {
        todayTab.classList.add('active');
        todayTab.classList.remove('inactive');
        sevenDaysTab.classList.add('inactive');
        sevenDaysTab.classList.remove('active');
    } else if (tab === 'seven-days') {
        sevenDaysTab.classList.add('active');
        sevenDaysTab.classList.remove('inactive');
        todayTab.classList.add('inactive');
        todayTab.classList.remove('active');
    }
}