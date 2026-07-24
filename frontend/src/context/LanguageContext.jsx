import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext({
  lang: 'vi',
  setLang: () => {},
  t: (k) => k,
});

const translations = {
  vi: {
    // Nav & Common
    'nav.home': 'Trang Chủ',
    'nav.about': 'Giới Thiệu',
    'nav.rooms': 'Danh Mục Phòng',
    'nav.gallery': 'Thư Viện Ảnh',
    'nav.contact': 'Liên Hệ',
    'nav.login': 'Đăng Nhập',
    'nav.register': 'Đăng Ký',
    'nav.logout': 'Đăng Xuất',
    'common.close': 'Đóng',
    'common.loading': 'Đang tải...',

    // Home
    'home.heroTitle': 'Đặt Phòng Khách Sạn Trực Tuyến',
    'home.arrival': 'Ngày Nhận Phòng',
    'home.departure': 'Ngày Trả Phòng',
    'home.bookNow': 'Đặt Ngay',
    'home.aboutTitle': 'Về Chúng Tôi',
    'home.aboutDesc': 'Chào mừng bạn đến với khách sạn của chúng tôi — nơi mỗi kỳ nghỉ trở thành một trải nghiệm đáng nhớ. Với các phòng được trang bị tiện nghi hiện đại, đội ngũ nhân viên chuyên nghiệp và vị trí thuận tiện, chúng tôi cam kết mang đến sự thoải mái và hài lòng tuyệt đối cho mỗi khách hàng.',
    'home.readMore': 'Xem Thêm',
    'home.roomsTitle': 'Danh Sách Phòng',
    'home.roomsSub': 'Chọn căn phòng phù hợp với nhu cầu của bạn',
    'home.pricePerDay': 'đ / ngày',
    'home.available': '● Còn trống',
    'home.rented': '● Đang thuê',
    'home.viewAllRooms': 'Xem Tất Cả Phòng',
    'home.galleryTitle': 'Thư Viện Ảnh',
    'home.blogTitle': 'Tin Tức & Sự Kiện',
    'home.blogSub': 'Tin tức và ưu đãi mới nhất từ khách sạn',
    'home.contactTitle': 'Liên Hệ Với Chúng Tôi',

    // Rooms Page
    'rooms.pageTitle': 'Danh Sách Phòng',
    'rooms.filterLabel': 'Lọc phòng:',
    'rooms.allTypes': 'Tất cả loại',
    'rooms.typePrefix': 'Loại',
    'rooms.allStatus': 'Tất cả',
    'rooms.loading': 'Đang tải danh sách phòng...',
    'rooms.notFound': 'Không tìm thấy phòng phù hợp.',
    'rooms.bookRoom': 'Đặt Phòng Ngay',
    'rooms.rentedBtn': 'Đã Có Người Thuê',
    'rooms.retry': 'Thử lại',
    'rooms.searchPlaceholder': '🔍 Tìm kiếm số phòng, loại, ghi chú...',
    'rooms.sortLabel': 'Sắp xếp:',
    'rooms.sortDefault': 'Mặc định',
    'rooms.sortAZ': 'Số phòng: A → Z',
    'rooms.sortZA': 'Số phòng: Z → A',
    'rooms.sortPriceHigh': 'Giá: Cao → Thấp',
    'rooms.sortPriceLow': 'Giá: Thấp → Cao',
    'rooms.showing': 'Hiển thị',
    'rooms.of': 'trong tổng số',
    'rooms.prev': '« Trước',
    'rooms.next': 'Sau »',
    'rooms.clearFilters': 'Xóa bộ lọc',


    // Booking Modal
    'booking.title': 'Đặt Phòng',
    'booking.checkinDate': 'Ngày nhận phòng',
    'booking.guestsLabel': 'Khách lưu trú',
    'booking.addGuest': '+ Thêm khách',
    'booking.guestName': 'Họ và tên *',
    'booking.idCard': 'CMND / Hộ chiếu *',
    'booking.address': 'Địa chỉ',
    'booking.domestic': '🇻🇳 Nội địa',
    'booking.foreign': '🌍 Nước ngoài',
    'booking.confirmBtn': '✓ Xác Nhận Đặt Phòng',
    'booking.successTitle': 'Đặt Phòng Thành Công!',
    'booking.successDesc': 'Nhân viên lễ tân sẽ xác nhận và liên hệ với bạn sớm nhất.',
    'booking.loginRequired': 'Bạn cần đăng nhập để đặt phòng.',

    // Auth
    'auth.loginTitle': 'Đăng Nhập',
    'auth.loginSub': 'Đăng nhập để đặt phòng ngay',
    'auth.usernamePlaceholder': 'Tên đăng nhập',
    'auth.passwordPlaceholder': 'Mật khẩu',
    'auth.loginBtn': 'Đăng Nhập',
    'auth.loggingIn': 'Đang đăng nhập...',
    'auth.noAccount': 'Chưa có tài khoản?',
    'auth.registerNow': 'Đăng ký ngay',
    'auth.registerTitle': 'Đăng Ký',
    'auth.registerSub': 'Tạo tài khoản để đặt phòng',
    'auth.fullNamePlaceholder': 'Họ và tên',
    'auth.registerBtn': 'Đăng Ký',
    'auth.registering': 'Đang đăng ký...',
    'auth.haveAccount': 'Đã có tài khoản?',

    // Contact & About
    'contact.name': 'Họ và tên',
    'contact.email': 'Email',
    'contact.phone': 'Số điện thoại',
    'contact.message': 'Nội dung tin nhắn',
    'contact.send': 'Gửi',
    'contact.sentTitle': 'Cảm ơn bạn đã liên hệ!',
    'contact.sentDesc': 'Chúng tôi sẽ phản hồi trong vòng 24 giờ.',
    'contact.sendAgain': 'Gửi lại',

    // Footer
    'footer.contactUs': 'Liên Hệ',
    'footer.menuLinks': 'Liên Kết Nhanh',
    'footer.newsletter': 'Đăng Ký Nhận Tin',
    'footer.emailPlaceholder': 'Nhập email của bạn',
    'footer.subscribe': 'Đăng ký',
    'footer.rights': 'Bản quyền được bảo lưu.',

    // Admin Tabs & Stats
    'admin.portal': 'TRANG QUẢN TRỊ KHÁCH SẠN',
    'admin.tab.rooms': '🏨 Tra Cứu Phòng',
    'admin.tab.checkin': '📝 Lập Phiếu Thuê',
    'admin.tab.checkout': '💳 Thanh Toán',
    'admin.tab.reports': '📊 Báo Cáo Tháng',
    'admin.tab.settings': '⚙️ Cấu Hình Quy Định',
    'admin.stats.total': 'Tổng số phòng',
    'admin.stats.available': 'Còn trống',
    'admin.stats.rented': 'Đang thuê',
    'booking.checkoutDate': 'Ngày trả phòng',
    'booking.surcharge3rd': '+25% phụ thu 3 khách',
    'booking.foreignSurcharge': 'x1.5 khách nước ngoài',
    'booking.priceEstimate': 'Ước tính chi phí',
    'booking.priceEstimateNote': '* Số ngày thực tế tính khi check-out',
    'booking.dateRangeError': 'Ngày trả phòng phải sau ngày nhận phòng.',
    'booking.dateMissingError': 'Vui lòng chọn cả ngày nhận phòng và ngày trả phòng.',
    'rooms.checkinLabel': '📅 Nhận phòng:',
    'rooms.checkoutLabel': '📅 Trả phòng:',
    'rooms.clearDateFilters': 'Xóa bộ lọc ngày',
  },
  en: {
    // Nav & Common
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.rooms': 'Our Rooms',
    'nav.gallery': 'Gallery',
    'nav.contact': 'Contact Us',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'common.close': 'Close',
    'common.loading': 'Loading...',

    // Home
    'home.heroTitle': 'Book a Room Online',
    'home.arrival': 'Check-in Date',
    'home.departure': 'Check-out Date',
    'home.bookNow': 'Book Now',
    'home.aboutTitle': 'About Us',
    'home.aboutDesc': 'Welcome to our hotel — where every stay becomes a memorable experience. With modern rooms, professional staff, and prime location, we commit to delivering absolute comfort and satisfaction to every guest.',
    'home.readMore': 'Read More',
    'home.roomsTitle': 'Our Rooms',
    'home.roomsSub': 'Choose the room that fits your needs',
    'home.pricePerDay': 'VND / day',
    'home.available': '● Available',
    'home.rented': '● Occupied',
    'home.viewAllRooms': 'View All Rooms',
    'home.galleryTitle': 'Gallery',
    'home.blogTitle': 'News & Events',
    'home.blogSub': 'Latest news and special offers from our hotel',
    'home.contactTitle': 'Contact Us',

    // Rooms Page
    'rooms.pageTitle': 'Our Rooms',
    'rooms.filterLabel': 'Filter rooms:',
    'rooms.allTypes': 'All Types',
    'rooms.typePrefix': 'Type',
    'rooms.allStatus': 'All Status',
    'rooms.loading': 'Loading room list...',
    'rooms.notFound': 'No rooms found matching filters.',
    'rooms.bookRoom': 'Book Room Now',
    'rooms.rentedBtn': 'Occupied',
    'rooms.retry': 'Retry',
    'rooms.searchPlaceholder': '🔍 Search room number, type, note...',
    'rooms.sortLabel': 'Sort by:',
    'rooms.sortDefault': 'Default',
    'rooms.sortAZ': 'Room No: A → Z',
    'rooms.sortZA': 'Room No: Z → A',
    'rooms.sortPriceHigh': 'Price: High → Low',
    'rooms.sortPriceLow': 'Price: Low → High',
    'rooms.showing': 'Showing',
    'rooms.of': 'of',
    'rooms.prev': '« Prev',
    'rooms.next': 'Next »',
    'rooms.clearFilters': 'Clear filters',


    // Booking Modal
    'booking.title': 'Book Room',
    'booking.checkinDate': 'Check-in Date',
    'booking.guestsLabel': 'Guests',
    'booking.addGuest': '+ Add Guest',
    'booking.guestName': 'Full Name *',
    'booking.idCard': 'ID Card / Passport *',
    'booking.address': 'Address',
    'booking.domestic': '🇻🇳 Domestic',
    'booking.foreign': '🌍 Foreign',
    'booking.confirmBtn': '✓ Confirm Booking',
    'booking.successTitle': 'Booking Successful!',
    'booking.successDesc': 'Our reception will confirm and contact you shortly.',
    'booking.loginRequired': 'You must log in to book a room.',

    // Auth
    'auth.loginTitle': 'Login',
    'auth.loginSub': 'Log in to book your room instantly',
    'auth.usernamePlaceholder': 'Username',
    'auth.passwordPlaceholder': 'Password',
    'auth.loginBtn': 'Login',
    'auth.loggingIn': 'Logging in...',
    'auth.noAccount': "Don't have an account?",
    'auth.registerNow': 'Register now',
    'auth.registerTitle': 'Register',
    'auth.registerSub': 'Create an account to book rooms',
    'auth.fullNamePlaceholder': 'Full Name',
    'auth.registerBtn': 'Register',
    'auth.registering': 'Registering...',
    'auth.haveAccount': 'Already have an account?',

    // Contact & About
    'contact.name': 'Full Name',
    'contact.email': 'Email',
    'contact.phone': 'Phone Number',
    'contact.message': 'Message Content',
    'contact.send': 'Send',
    'contact.sentTitle': 'Thank you for contacting us!',
    'contact.sentDesc': 'We will get back to you within 24 hours.',
    'contact.sendAgain': 'Send Another',

    // Footer
    'footer.contactUs': 'Contact Us',
    'footer.menuLinks': 'Quick Links',
    'footer.newsletter': 'Newsletter',
    'footer.emailPlaceholder': 'Enter your email',
    'footer.subscribe': 'Subscribe',
    'footer.rights': 'All Rights Reserved.',

    // Admin Tabs & Stats
    'admin.portal': 'HOTELIFY ADMIN PORTAL',
    'admin.tab.rooms': '🏨 Room Directory',
    'admin.tab.checkin': '📝 Check-in Voucher',
    'admin.tab.checkout': '💳 Checkout & Invoice',
    'admin.tab.reports': '📊 Monthly Reports',
    'admin.tab.settings': '⚙️ System Settings',
    'admin.stats.total': 'Total Rooms',
    'admin.stats.available': 'Available',
    'admin.stats.rented': 'Occupied',
    'booking.checkoutDate': 'Check-out Date',
    'booking.surcharge3rd': '+25% surcharge for 3 guests',
    'booking.foreignSurcharge': 'x1.5 foreign coefficient',
    'booking.priceEstimate': 'Estimated cost',
    'booking.priceEstimateNote': '* Actual days computed at check-out',
    'booking.dateRangeError': 'Check-out date must be after check-in date.',
    'booking.dateMissingError': 'Please select both check-in and check-out dates.',
    'rooms.checkinLabel': '📅 Check-in:',
    'rooms.checkoutLabel': '📅 Check-out:',
    'rooms.clearDateFilters': 'Clear date filters',
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('app_lang') || 'vi';
  });

  const setLang = (newLang) => {
    localStorage.setItem('app_lang', newLang);
    setLangState(newLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['vi']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext) || {
  lang: 'vi',
  setLang: () => {},
  t: (k) => k,
};
