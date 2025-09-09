// Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    update, 
    push, 
    onValue,
    query,
    orderByChild,
    equalTo
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCwUFo1k8jqgE2FLSILhV1I9rf1M7x5S_4",
    authDomain: "make-money-7aea2.firebaseapp.com",
    databaseURL: "https://make-money-7aea2-default-rtdb.firebaseio.com",
    projectId: "make-money-7aea2",
    storageBucket: "make-money-7aea2.firebasestorage.app",
    messagingSenderId: "584084915395",
    appId: "1:584084915395:web:a5cb8ef3410a1312048e76",
    measurementId: "G-ZQJ3M74ERQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// DOM Elements
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginFormElement');
const signupForm = document.getElementById('signupFormElement');
const appDiv = document.getElementById('app');
const userNameEl = document.getElementById('userName');
const drawerMenu = document.getElementById('drawerMenu');
const menuToggle = document.getElementById('menuToggle');
const closeDrawer = document.getElementById('closeDrawer');
const drawerNavItems = document.querySelectorAll('.nav-item');
const drawerUserName = document.getElementById('drawerUserName');
const drawerUserEmail = document.getElementById('drawerUserEmail');
const userAvatar = document.getElementById('userAvatar');
const mainBalanceEl = document.getElementById('mainBalance');
const videoBalanceEl = document.getElementById('videoBalance');
const referralBalanceEl = document.getElementById('referralBalance');
const premiumStatusEl = document.getElementById('premiumStatus');
const getPremiumBtn = document.getElementById('getPremiumBtn');
const tabContents = document.querySelectorAll('.tab-content');
const videosWatchedEl = document.getElementById('videosWatched');
const totalReferralsEl = document.getElementById('totalReferrals');
const totalEarningsEl = document.getElementById('totalEarnings');
const userReferralCodeEl = document.getElementById('userReferralCode');
const copyReferralCodeBtn = document.getElementById('copyReferralCode');
const withdrawForm = document.getElementById('withdrawForm');
const withdrawAmountEl = document.getElementById('withdrawAmount');
const withdrawPhoneEl = document.getElementById('withdrawPhone');
const serviceFeeEl = document.getElementById('serviceFee');
const netAmountEl = document.getElementById('netAmount');
const withdrawBtn = document.getElementById('withdrawBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const youtubeVideosEl = document.getElementById('youtubeVideos');
const tiktokVideosEl = document.getElementById('tiktokVideos');
const referredUsersListEl = document.getElementById('referredUsersList');
const pendingWithdrawalsListEl = document.getElementById('pendingWithdrawalsList');
const historyListEl = document.getElementById('historyList');
const filterBtns = document.querySelectorAll('.filter-btn');
const logoutNav = document.getElementById('logoutNav');

// Global variables
let currentUser = null;
let userData = null;
let videosWatched = 0;
let totalReferrals = 0;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkAuthState();
    showAuthModal();
});

// Setup event listeners
function setupEventListeners() {
    // Auth modal
    document.querySelector('.close').addEventListener('click', () => {
        authModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });

    // Switch between login/signup
    document.getElementById('showSignup').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').classList.remove('active');
        document.getElementById('signupForm').classList.add('active');
    });

    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signupForm').classList.remove('active');
        document.getElementById('loginForm').classList.add('active');
    });

    // Login form
    loginForm.addEventListener('submit', handleLogin);

    // Signup form
    signupForm.addEventListener('submit', handleSignup);

    // Drawer menu
    menuToggle.addEventListener('click', toggleDrawer);
    closeDrawer.addEventListener('click', toggleDrawer);

    // Navigation items
    drawerNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = item.dataset.tab;
            if (targetTab) {
                switchTab(targetTab);
                toggleDrawer();
            }
        });
    });

    // Logout
    logoutNav.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
        toggleDrawer();
    });

    // Premium button
    getPremiumBtn.addEventListener('click', handleGetPremium);

    // Copy referral code
    copyReferralCodeBtn.addEventListener('click', copyReferralCode);

    // Withdraw form
    withdrawAmountEl.addEventListener('input', calculateWithdrawFee);
    withdrawForm.addEventListener('submit', handleWithdraw);

    // History filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.currentTarget.dataset.filter;
            filterHistory(filter);
            filterBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });

    // Share buttons
    document.querySelector('.whatsapp').addEventListener('click', () => shareReferral('whatsapp'));
    document.querySelector('.telegram').addEventListener('click', () => shareReferral('telegram'));
    document.querySelector('.facebook').addEventListener('click', () => shareReferral('facebook'));

    // Unlock premium buttons
    document.getElementById('unlockYoutube').addEventListener('click', handleGetPremium);
    document.getElementById('unlockTiktok').addEventListener('click', handleGetPremium);
}

// Toggle drawer menu
function toggleDrawer() {
    drawerMenu.classList.toggle('open');
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    if (drawerMenu.classList.contains('open')) {
        document.body.appendChild(overlay);
        overlay.addEventListener('click', toggleDrawer);
    } else {
        const existingOverlay = document.querySelector('.overlay');
        if (existingOverlay) existingOverlay.remove();
    }
}

// Show auth modal on load
function showAuthModal() {
    authModal.style.display = 'block';
}

// Check authentication state
function checkAuthState() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            loadUserData();
            showApp();
            hideAuthModal();
        } else {
            currentUser = null;
            showAuthModal();
            hideApp();
        }
    });
}

// Load user data from database
async function loadUserData() {
    if (!currentUser) return;

    showLoading(true);
    
    try {
        const userRef = ref(database, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            userData = snapshot.val();
            updateUI();
            loadVideos();
            loadReferrals();
            loadPendingWithdrawals();
            loadHistory();
        } else {
            // New user - create default data
            await createNewUser();
        }
    } catch (error) {
        showMessage('Error loading user data: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Create new user data
async function createNewUser() {
    const referralCode = generateReferralCode();
    const welcomeBonus = 3000;
    
    const userData = {
        name: currentUser.displayName || 'User',
        email: currentUser.email,
        phone: '',
        referralCode: referralCode,
        referredBy: null,
        mainBalance: welcomeBonus,
        videoBalance: 0,
        referralBalance: 0,
        totalEarnings: welcomeBonus,
        videosWatched: 0,
        totalReferrals: 0,
        isPremium: false,
        premiumApproved: false,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        withdrawalRequests: [],
        transactionHistory: [
            {
                id: Date.now(),
                type: 'bonus',
                amount: welcomeBonus,
                description: 'Welcome Bonus',
                date: new Date().toISOString(),
                balanceAfter: welcomeBonus
            }
        ]
    };

    // Check if user used referral code
    const urlParams = new URLSearchParams(window.location.search);
    const referralFromUrl = urlParams.get('ref');
    
    if (referralFromUrl) {
        const referrerSnapshot = await get(query(
            ref(database, 'users'), 
            orderByChild('referralCode'), 
            equalTo(referralFromUrl)
        ));
        
        if (referrerSnapshot.exists()) {
            const referrerData = Object.values(referrerSnapshot.val())[0];
            userData.referredBy = referrerData.email;
        }
    }

    await set(ref(database, `users/${currentUser.uid}`), userData);
    await updateProfile(currentUser, { displayName: userData.name });
    
    this.userData = userData;
    updateUI();
}

// Generate unique referral code
function generateReferralCode() {
    return 'MTN' + Math.random().toString(36).substr(2, 4).toUpperCase() + 
           Math.random().toString(36).substr(2, 3).toUpperCase();
}

// Update UI with user data
function updateUI() {
    if (!userData) return;

    userNameEl.textContent = userData.name;
    drawerUserName.textContent = userData.name;
    drawerUserEmail.textContent = userData.email;
    userAvatar.textContent = userData.name.charAt(0).toUpperCase();
    mainBalanceEl.textContent = formatCurrency(userData.mainBalance);
    videoBalanceEl.textContent = formatCurrency(userData.videoBalance);
    referralBalanceEl.textContent = formatCurrency(userData.referralBalance);
    totalEarningsEl.textContent = formatCurrency(userData.totalEarnings);
    videosWatchedEl.textContent = userData.videosWatched;
    totalReferralsEl.textContent = userData.totalReferrals;
    userReferralCodeEl.textContent = userData.referralCode;

    // Update premium status
    if (userData.isPremium && userData.premiumApproved) {
        premiumStatusEl.textContent = 'Premium User';
        premiumStatusEl.style.color = '#00d4aa';
        getPremiumBtn.style.display = 'none';
        document.querySelectorAll('.premium-locked').forEach(el => el.style.display = 'none');
        youtubeVideosEl.classList.remove('hidden');
        tiktokVideosEl.classList.remove('hidden');
    } else {
        premiumStatusEl.textContent = userData.premiumApproved ? 'Premium (Pending)' : 'Free User';
        getPremiumBtn.style.display = 'block';
        document.querySelectorAll('.premium-locked').forEach(el => el.style.display = 'block');
        youtubeVideosEl.classList.add('hidden');
        tiktokVideosEl.classList.add('hidden');
    }

    // Update active nav item
    drawerNavItems.forEach(item => item.classList.remove('active'));
    const activeTab = document.querySelector('.tab-content.active').id;
    const activeNavItem = document.querySelector(`.nav-item[data-tab="${activeTab}"]`);
    if (activeNavItem) activeNavItem.classList.add('active');
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-UG', {
        style: 'currency',
        currency: 'UGX',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    showLoading(true);

    try {
        await signInWithEmailAndPassword(auth, email, password);
        showMessage('Login successful!', 'success');
    } catch (error) {
        showMessage('Login failed: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const phone = document.getElementById('signupPhone').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const referralCode = document.getElementById('referralCode').value.trim();

    showLoading(true);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });

        // Update user data with phone and referral
        const userRef = ref(database, `users/${userCredential.user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            await update(userRef, { 
                phone: phone,
                referredBy: referralCode || null 
            });
        }

        showMessage('Account created successfully! Welcome bonus of 3,000 UGX added.', 'success');
    } catch (error) {
        showMessage('Signup failed: ' + error.message, 'error');
    } finally {
        showLoading(false);
        signupForm.reset();
    }
}

// Handle logout
async function handleLogout() {
    try {
        await signOut(auth);
        showMessage('Logged out successfully!', 'success');
    } catch (error) {
        showMessage('Logout failed: ' + error.message, 'error');
    }
}

// Switch tabs
function switchTab(tabName) {
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    updateUI();
}

// Handle get premium
function handleGetPremium() {
    const paymentUrl = `https://www.payments.com/pay?amount=5000&user=${currentUser.uid}&app=mtn-cash-x`;
    window.open(paymentUrl, '_blank');
    
    showMessage('Redirecting to payment gateway. After successful payment, wait for admin approval.', 'success');
    
    if (userData && !userData.isPremium) {
        updateUserData({ isPremium: true, premiumApproved: false });
    }
}

// Copy referral code
function copyReferralCode() {
    navigator.clipboard.writeText(userData.referralCode).then(() => {
        showMessage('Referral code copied to clipboard!', 'success');
        copyReferralCodeBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyReferralCodeBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Code';
        }, 2000);
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = userData.referralCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showMessage('Referral code copied to clipboard!', 'success');
    });
}

// Share referral
function shareReferral(platform) {
    const message = `Join MTN CASH X and start earning money online! Use my referral code: ${userData.referralCode} to get started. Download now: https://mtncashx.com?ref=${userData.referralCode}`;
    let shareUrl = '';

    switch(platform) {
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${encodeURIComponent('https://mtncashx.com')}&text=${encodeURIComponent(message)}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=https://mtncashx.com&quote=${encodeURIComponent(message)}`;
            break;
    }

    window.open(shareUrl, '_blank');
}

// Load videos from admin panel
async function loadVideos() {
    try {
        const youtubeRef = ref(database, 'admin/videos/youtube');
        const tiktokRef = ref(database, 'admin/videos/tiktok');
        
        onValue(youtubeRef, (snapshot) => {
            if (userData && userData.isPremium && userData.premiumApproved) {
                const videos = snapshot.val();
                displayVideos(videos, 'youtube', youtubeVideosEl);
            }
        });

        onValue(tiktokRef, (snapshot) => {
            if (userData && userData.isPremium && userData.premiumApproved) {
                const videos = snapshot.val();
                displayVideos(videos, 'tiktok', tiktokVideosEl);
            }
        });
    } catch (error) {
        console.error('Error loading videos:', error);
    }
}

// Display videos
function displayVideos(videos, type, container) {
    if (!videos) {
        container.innerHTML = '<div class="no-data">No videos available</div>';
        return;
    }

    container.innerHTML = Object.values(videos).map(video => `
        <div class="video-item" data-video-id="${video.id}">
            <i class="fab fa-${type === 'youtube' ? 'youtube' : 'tiktok'}"></i>
            <div class="video-info">
                <h4>${video.title}</h4>
                <p>${video.duration} • ${video.earnings} UGX</p>
            </div>
            <button class="btn-watch" onclick="watchVideo('${video.id}', '${type}')">
                <i class="fas fa-play"></i> Watch & Earn
            </button>
        </div>
    `).join('');
}

// Watch video
window.watchVideo = async function(videoId, type) {
    const btn = event.target.closest('.btn-watch');
    if (!btn || btn.disabled) return;

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Watching...';

    try {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const earnings = 500;
        const videoType = type === 'youtube' ? 'YouTube' : 'TikTok';

        const newVideoBalance = (userData.videoBalance || 0) + earnings;
        const newTotalEarnings = (userData.totalEarnings || 0) + earnings;
        const newVideosWatched = (userData.videosWatched || 0) + 1;

        const transaction = {
            id: Date.now(),
            type: 'video',
            subtype: type,
            amount: earnings,
            description: `Watched ${videoType} video`,
            date: new Date().toISOString(),
            balanceAfter: newVideoBalance
        };

        await update(ref(database, `users/${currentUser.uid}`), {
            videoBalance: newVideoBalance,
            totalEarnings: newTotalEarnings,
            videosWatched: newVideosWatched,
            'transactionHistory/-': transaction
        });

        showMessage(`Great! You earned ${formatCurrency(earnings)} for watching the video.`, 'success');
        loadUserData();

    } catch (error) {
        showMessage('Error watching video: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-play"></i> Watched';
        setTimeout(() => {
            btn.style.display = 'none';
        }, 2000);
    }
};

// Load referrals
async function loadReferrals() {
    try {
        const referralsRef = query(
            ref(database, 'users'),
            orderByChild('referredBy'),
            equalTo(userData.email)
        );

        onValue(referralsRef, (snapshot) => {
            const referrals = [];
            snapshot.forEach(child => {
                const referral = child.val();
                if (referral.isPremium && referral.premiumApproved) {
                    referrals.push(referral);
                }
            });

            displayReferrals(referrals);
            totalReferralsEl.textContent = referrals.length;
        });
    } catch (error) {
        console.error('Error loading referrals:', error);
    }
}

// Display referrals
function displayReferrals(referrals) {
    if (referrals.length === 0) {
        referredUsersListEl.innerHTML = '<div class="no-data">No successful referrals yet</div>';
        return;
    }

    referredUsersListEl.innerHTML = referrals.map(referral => `
        <div class="referred-user-item">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div class="user-avatar">${referral.name.charAt(0)}</div>
                <div>
                    <div style="font-weight: 600;">${referral.name}</div>
                    <div style="font-size: 0.9rem; color: #666;">${referral.email}</div>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 600; color: #00d4aa;">+2,500 UGX</div>
                <div style="font-size: 0.8rem; color: #999;">${new Date(referral.createdAt).toLocaleDateString()}</div>
            </div>
        </div>
    `).join('');
}

// Calculate withdrawal fee
function calculateWithdrawFee() {
    const amount = parseInt(withdrawAmountEl.value) || 0;
    if (amount < 1000 || amount > (userData.referralBalance || 0)) {
        withdrawBtn.disabled = true;
        serviceFeeEl.textContent = '0';
        netAmountEl.textContent = '0';
        if (amount > (userData.referralBalance || 0)) {
            showMessage('Withdrawal amount cannot exceed your referral balance.', 'error');
        }
        return;
    }

    const fee = Math.round(amount * 0.1);
    const netAmount = amount - fee;
    
    serviceFeeEl.textContent = fee;
    netAmountEl.textContent = netAmount;
    withdrawBtn.disabled = false;
}

// Handle withdrawal
async function handleWithdraw(e) {
    e.preventDefault();
    
    const amount = parseInt(withdrawAmountEl.value);
    if (!userData || userData.referralBalance < 1000) {
        showMessage('Insufficient referral balance. Minimum withdrawal is 1,000 UGX.', 'error');
        return;
    }

    if (amount > userData.referralBalance) {
        showMessage('Cannot withdraw more than your referral balance.', 'error');
        return;
    }

    const phone = withdrawPhoneEl.value;
    const fee = Math.round(amount * 0.1);
    const netAmount = amount - fee;

    showLoading(true);

    try {
        const withdrawalRequest = {
            id: Date.now(),
            amount: amount,
            fee: fee,
            netAmount: netAmount,
            phone: phone,
            status: 'pending',
            requestedAt: new Date().toISOString(),
            userId: currentUser.uid,
            userName: userData.name,
            userEmail: userData.email
        };

        const userWithdrawalsRef = ref(database, `users/${currentUser.uid}/withdrawalRequests`);
        await push(userWithdrawalsRef, withdrawalRequest);

        const adminWithdrawalsRef = ref(database, 'admin/pendingWithdrawals');
        await push(adminWithdrawalsRef, withdrawalRequest);

        const newReferralBalance = userData.referralBalance - amount;
        const transaction = {
            id: Date.now(),
            type: 'withdraw',
            amount: -amount,
            description: `Withdrawal request - ${phone}`,
            date: new Date().toISOString(),
            balanceAfter: newReferralBalance,
            status: 'pending'
        };

        await update(ref(database, `users/${currentUser.uid}`), {
            referralBalance: newReferralBalance,
            'transactionHistory/-': transaction
        });

        showMessage(`Withdrawal request of ${formatCurrency(netAmount)} submitted successfully! Waiting for admin approval.`, 'success');
        withdrawForm.reset();
        withdrawBtn.disabled = true;
        loadUserData();

    } catch (error) {
        showMessage('Withdrawal request failed: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Load pending withdrawals
async function loadPendingWithdrawals() {
    if (!userData) return;

    const withdrawalsRef = ref(database, `users/${currentUser.uid}/withdrawalRequests`);
    onValue(withdrawalsRef, (snapshot) => {
        const withdrawals = snapshot.val() ? Object.values(snapshot.val()) : [];
        displayPendingWithdrawals(withdrawals);
    });
}

// Display pending withdrawals
function displayPendingWithdrawals(withdrawals) {
    if (withdrawals.length === 0) {
        pendingWithdrawalsListEl.innerHTML = '<div class="no-data">No pending withdrawals</div>';
        return;
    }

    pendingWithdrawalsListEl.innerHTML = withdrawals.map(w => `
        <div class="pending-item ${w.status}">
            <div>
                <div style="font-weight: 600;">${formatCurrency(w.netAmount)}</div>
                <div style="font-size: 0.9rem; color: #666;">${w.phone}</div>
                <div style="font-size: 0.8rem; color: #999;">${new Date(w.requestedAt).toLocaleDateString()}</div>
            </div>
            <div style="text-align: right;">
                <span class="status-badge ${w.status}">${w.status.toUpperCase()}</span>
            </div>
        </div>
    `).join('');
}

// Load history
async function loadHistory() {
    if (!userData) return;

    const historyRef = ref(database, `users/${currentUser.uid}/transactionHistory`);
    onValue(historyRef, (snapshot) => {
        const history = snapshot.val() ? Object.values(snapshot.val()) : userData.transactionHistory || [];
        displayHistory(history, 'all');
    });
}

// Display history
function displayHistory(history, filter = 'all') {
    let filteredHistory = history;

    if (filter !== 'all') {
        filteredHistory = history.filter(item => item.type === filter || (filter === 'video' && item.subtype));
    }

    if (filteredHistory.length === 0) {
        historyListEl.innerHTML = '<div class="no-data">No transactions found</div>';
        return;
    }

    filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    historyListEl.innerHTML = filteredHistory.map(item => {
        const typeClass = item.type === 'video' ? item.subtype : item.type;
        const amountClass = item.amount >= 0 ? 'positive' : 'negative';
        const status = item.status ? `<div style="font-size: 0.8rem; color: ${item.status === 'approved' ? '#28a745' : item.status === 'rejected' ? '#dc3545' : '#6c757d'}">${item.status}</div>` : '';

        return `
            <div class="history-item ${typeClass}">
                <div class="history-details">
                    <h4>${getTransactionDescription(item)}</h4>
                    <div style="font-size: 0.9rem; color: #666;">${new Date(item.date).toLocaleString()}</div>
                    ${status}
                </div>
                <div style="text-align: right;">
                    <div class="history-amount ${amountClass}">${formatCurrency(item.amount)}</div>
                    <div style="font-size: 0.8rem; color: #999;">Balance: ${formatCurrency(item.balanceAfter)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Filter history
function filterHistory(filter) {
    loadHistory().then(() => {
        displayHistory(userData.transactionHistory || [], filter);
    });
}

// Get transaction description
function getTransactionDescription(transaction) {
    switch(transaction.type) {
        case 'bonus':
            return 'Welcome Bonus';
        case 'referral':
            return 'Referral Commission';
        case 'video':
            return `Watched ${transaction.subtype === 'youtube' ? 'YouTube' : 'TikTok'} Video`;
        case 'withdraw':
            return `Withdrawal Request`;
        case 'premium':
            return 'Premium Purchase';
        default:
            return transaction.description || 'Transaction';
    }
}

// Update user data
async function updateUserData(updates) {
    if (!currentUser || !userData) return;

    try {
        await update(ref(database, `users/${currentUser.uid}`), updates);
        userData = { ...userData, ...updates };
        updateUI();
    } catch (error) {
        showMessage('Error updating user data: ' + error.message, 'error');
    }
}

// Show/hide app
function showApp() {
    appDiv.classList.remove('hidden');
}

function hideApp() {
    appDiv.classList.add('hidden');
}

// Show/hide auth modal
function hideAuthModal() {
    authModal.style.display = 'none';
}

// Show loading
function showLoading(show = true) {
    loadingOverlay.classList.toggle('hidden', !show);
}

// Show message
function showMessage(message, type = 'success') {
    const existing = document.querySelector('.success-message, .error-message');
    if (existing) existing.remove();

    const messageEl = document.createElement('div');
    messageEl.className = type === 'success' ? 'success-message' : 'error-message';
    messageEl.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;

    const mainContent = document.querySelector('.dashboard-content .container');
    if (mainContent) {
        mainContent.insertBefore(messageEl, mainContent.firstChild);
    } else {
        document.body.insertBefore(messageEl, document.body.firstChild);
    }

    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.remove();
        }
    }, 5000);
}

// Listen for referral earnings
async function listenForReferralEarnings() {
    if (!currentUser || !userData) return;

    const usersRef = ref(database, 'users');
    onValue(usersRef, async (snapshot) => {
        const users = snapshot.val();
        if (!users) return;

        Object.entries(users).forEach(([userId, user]) => {
            if (user.referredBy === userData.email && 
                user.isPremium && 
                user.premiumApproved && 
                !userData.referralEarnings?.[userId]) {
                
                const referralBonus = 2500;
                const newReferralBalance = (userData.referralBalance || 0) + referralBonus;
                const newTotalEarnings = (userData.totalEarnings || 0) + referralBonus;

                updateUserData({
                    referralBalance: newReferralBalance,
                    totalEarnings: newTotalEarnings,
                    totalReferrals: (userData.totalReferrals || 0) + 1,
                    [`referralEarnings/${userId}`]: {
                        userId: userId,
                        userName: user.name,
                        amount: referralBonus,
                        date: new Date().toISOString()
                    }
                });

                const transaction = {
                    id: Date.now(),
                    type: 'referral',
                    amount: referralBonus,
                    description: `Referral bonus from ${user.name}`,
                    date: new Date().toISOString(),
                    balanceAfter: newReferralBalance
                };

                push(ref(database, `users/${currentUser.uid}/transactionHistory`), transaction);

                showMessage(`Congratulations! You earned ${formatCurrency(referralBonus)} from ${user.name}'s premium purchase!`, 'success');
            }
        });
    });
}

if (currentUser) {
    listenForReferralEarnings();
}