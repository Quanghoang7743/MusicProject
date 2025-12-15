const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#0c1a2a] to-[#0b1320] text-white pt-12 pb-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto text-center md:text-left">
        {/* Top logo and name */}
        <div className="flex flex-col items-center md:items-center mb-10">
          <div className="bg-cyan-500 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center text-lg mb-2">
            M
          </div>
          <h2 className="text-lg font-semibold">The Miraculous</h2>
        </div>

        {/* Grid sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-cyan-400 font-semibold mb-3">
              Miraculous Music Station
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor.
            </p>
          </div>

          {/* Download Section */}
          <div>
            <h3 className="text-cyan-400 font-semibold mb-3">Download Our App</h3>
            <p className="text-sm text-slate-300 mb-3">
              Go Mobile with our app. Listen to your favourite songs at just one click. Download Now!
            </p>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
              <a href="#" aria-label="Download on Google Play" className="inline-block">
                <img
                  src="/images/googleplay.jpg"
                  alt="Google Play"
                  loading="lazy"
                  className="h-8 md:h-10 w-auto object-contain rounded-md shadow-sm transform hover:scale-105 transition-transform"
                />
              </a>

              <a href="#" aria-label="Download on App Store" className="inline-block">
                <img
                  src="/images/appstore.jpg"
                  alt="App Store"
                  loading="lazy"
                  className="h-8 md:h-10 w-auto object-contain rounded-md shadow-sm transform hover:scale-105 transition-transform"
                />
              </a>

              <a href="#" aria-label="Download on Windows Store" className="inline-block">
                <img
                  src="/images/windowstore.jpg"
                  alt="Windows Store"
                  loading="lazy"
                  className="h-8 md:h-10 w-auto object-contain rounded-md shadow-sm transform hover:scale-105 transition-transform"
                />
              </a>
            </div>
          </div>

          {/* Subscribe Section */}
          <div>
            <h3 className="text-cyan-400 font-semibold mb-3">Subscribe</h3>
            <p className="text-sm text-slate-300 mb-4">
              Subscribe to our newsletter and get latest updates and offers.
            </p>
            <input
              type="text"
              placeholder="Enter Your Name"
              className="w-full bg-slate-800 rounded-md px-3 py-2 mb-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <input
              type="email"
              placeholder="Enter Your Email"
              className="w-full bg-slate-800 rounded-md px-3 py-2 mb-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-md w-full py-2 transition">
              Sign Me Up
            </button>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-cyan-400 font-semibold mb-3">Contact Us</h3>
            <p className="text-sm text-slate-300 mb-2">
              <span className="font-medium">Call Us:</span> (+1) 202-555-0176, (+1) 2025-5501
            </p>
            <p className="text-sm text-slate-300 mb-2">
              <span className="font-medium">Email Us:</span> demo@mail.com, dummy@mail.com
            </p>
            <p className="text-sm text-slate-300 mb-4">
              <span className="font-medium">Walk In:</span> 598 Old House Drive, London
            </p>
            <div className="flex justify-center md:justify-start gap-3 mt-4">
              <a href="#" className="bg-cyan-500 hover:bg-cyan-600 rounded p-2 text-white">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="bg-cyan-500 hover:bg-cyan-600 rounded p-2 text-white">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="bg-cyan-500 hover:bg-cyan-600 rounded p-2 text-white">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="bg-cyan-500 hover:bg-cyan-600 rounded p-2 text-white">
                <i className="fab fa-google-plus-g"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Footer bottom text */}
        <div className="border-t border-slate-700 mt-12 pt-6 text-center text-xs text-slate-400">
          Copyright © 2025{" "}
          <span className="text-cyan-400">The Miraculous Music Template</span>. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
