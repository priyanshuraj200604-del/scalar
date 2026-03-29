import './Footer.css';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer" id="main-footer">
      <button className="footer-back-to-top" onClick={scrollToTop}>
        Back to top
      </button>

      <div className="footer-main">
        <div className="footer-grid container">
          <div className="footer-col">
            <h4>Get to Know Us</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Press Releases</a>
            <a href="#">Amazon Science</a>
          </div>
          <div className="footer-col">
            <h4>Connect with Us</h4>
            <a href="#">Facebook</a>
            <a href="#">Twitter</a>
            <a href="#">Instagram</a>
          </div>
          <div className="footer-col">
            <h4>Make Money with Us</h4>
            <a href="#">Sell on Amazon</a>
            <a href="#">Sell under Amazon Accelerator</a>
            <a href="#">Protect and Build Your Brand</a>
            <a href="#">Amazon Global Selling</a>
          </div>
          <div className="footer-col">
            <h4>Let Us Help You</h4>
            <a href="#">Your Account</a>
            <a href="#">Returns Centre</a>
            <a href="#">100% Purchase Protection</a>
            <a href="#">Amazon App Download</a>
            <a href="#">Help</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-logo">
          <span className="logo-text" style={{fontSize: '18px'}}>amazon</span>
          <span className="logo-suffix" style={{fontSize: '11px'}}>.clone</span>
        </div>
        <p className="footer-copyright">© 2026 Amazon Clone. Built as an SDE Intern Assignment.</p>
      </div>
    </footer>
  );
}
