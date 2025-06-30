// js/footer.js
function createFooter() {
    return `
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>AquaTech Solutions</h3>
                    <p>Đối tác tin cậy trong lĩnh vực công nghệ thủy sản, mang đến những giải pháp tiên tiến và bền vững cho ngành nuôi trồng thủy sản Việt Nam.</p>
                    <div class="social-links">
                        <a href="https://www.facebook.com/danh.huynhcong.52035" target="_blank" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://www.tiktok.com/@sail.engineering?_t=ZS-8xZxZrVbMYM&_r=1" target="_blank" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
                        <a href="https://zalo.me/0377530762" target="_blank" aria-label="Zalo"><img src="${getAssetPath('css/zalo-icon.png')}" alt="Zalo" class="zalo-icon" style="width: 2em; height: 2em;"></a>
                    </div>
                </div>
                
                <div class="footer-section">
                    <h3>Giải Pháp</h3>
                    <ul>
                        <li><a href="${getAssetPath('solutions/nuoi-ca.html')}">Nuôi cá công nghệ cao</a></li>
                        <li><a href="${getAssetPath('solutions/nuoi-cua.html')}">Nuôi cua chuyên nghiệp</a></li>
                        <li><a href="${getAssetPath('solutions/may-moc.html')}">Máy móc & tự động hóa</a></li>
                        <li><a href="${getAssetPath('solutions/ung-dung.html')}">Ứng dụng công nghệ</a></li>
                        <li><a href="${getAssetPath('solutions/aquaponics.html')}">Aquaponics</a></li>
                        <li><a href="${getAssetPath('solutions/tu-van.html')}">Tư vấn & đào tạo</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h3>Dịch Vụ</h3>
                    <ul>
                        <li><a href="#">Thiết kế hệ thống</a></li>
                        <li><a href="#">Lắp đặt thiết bị</a></li>
                        <li><a href="#">Bảo trì & vận hành</a></li>
                        <li><a href="#">Đào tạo kỹ thuật</a></li>
                        <li><a href="#">Hỗ trợ 24/7</a></li>
                        <li><a href="#">Tư vấn chuyên nghiệp</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h3>Liên Hệ</h3>
                    <p><i class="fas fa-map-marker-alt"></i> <a href="https://maps.google.com/?q=Xã+Tam+Thanh,+Thành+phố+Tam+Kỳ,+Quảng+Nam,+Việt+Nam" target="_blank" class="map-link">Xã Tam Thanh - Thành phố Tam Kỳ - Quảng Nam</a></p>
                    <p><i class="fas fa-phone"></i> <a href="tel:+84377530762">+84 377 530 762</a></p>
                    <p><i class="fas fa-envelope"></i> <a href="mailto:Sail.vnvn@gmail.com">Sail.vnvn@gmail.com</a></p>
                    <p><i class="fas fa-globe"></i> <a href="https://www.aquatech-solutions.vn" target="_blank">www.aquatech-solutions.vn</a></p>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2025 AquaTech Solutions. Tất cả quyền được bảo lưu. | Thiết kế bởi AquaTech Team</p>
            </div>
        </div>
    </footer>
    `;
}

// Helper function to handle relative paths
function getAssetPath(path) {
    // Check if we're in a subdirectory
    const currentPath = window.location.pathname;
    const isInSubdirectory = currentPath.includes('/solutions/');
    
    if (isInSubdirectory) {
        // We're in solutions directory, need to go up one level
        return path.startsWith('solutions/') ? path.replace('solutions/', '') : '../' + path;
    } else {
        // We're in root directory
        return path;
    }
}

// Function to load footer
function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = createFooter();
    }
}

// Load footer when DOM is ready
document.addEventListener('DOMContentLoaded', loadFooter);