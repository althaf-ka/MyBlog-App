import "./PrivacyPolicy.css";

function PrivacyPolicy() {
  return (
    <div className="privacy-policy-container">
      <h2>Privacy Policy for MyBlog</h2>
      <h4>Effective from : 2023</h4>

      <p>
        Welcome to MyBlog! Your privacy is important to us, and we are committed
        to protecting your personal information. This Privacy Policy explains
        how we collect, use, disclose, and safeguard your information when you
        use our services.
      </p>

      <div className="policys">
        <h3>1. Information We Collect</h3>
        <p>
          We collect information that you provide to us when using MyBlog. This
          may include your name, email address, profile picture, and other
          information you choose to share with us.
        </p>

        <h3>2. How We Use Your Information</h3>
        <p>
          We manage accounts, enable blog sharing, and support user
          interactions.We send important updates via email.
        </p>

        <h3>3. Your Choices</h3>
        <p>
          You can control how your information is used on MyBlog.Your profile
          information can be edited and updated at any time.
        </p>

        <h3>4. Security</h3>
        <p>
          We prioritize your data's security and employ industry-standard
          measures. However, please note that no online transmission or storage
          method can be entirely infallible, and we cannot ensure absolute
          security.
        </p>

        <h3>5. Changes to this Privacy Policy</h3>
        <p>
          We may update our Privacy Policy to reflect changes in our practices
          or laws. We will notify you of any important changes.
        </p>

        <h3>6. Contact Us</h3>
        <p>
          If you have any questions, concerns, or requests related to your
          privacy or this Privacy Policy, please contact us at socials.
        </p>
      </div>

      <h3 className="end-policy">Thank you for using MyBlog!</h3>
    </div>
  );
}

export default PrivacyPolicy;
