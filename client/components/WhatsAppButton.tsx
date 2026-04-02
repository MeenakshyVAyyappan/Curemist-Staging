const WhatsAppButton = () => (
    <a
        href="https://wa.me/918848815296"
        target="_blank"
        rel="noreferrer"
        className="fixed right-5 bottom-6 md:right-8 md:bottom-8 z-50 flex flex-col items-center gap-2 hover:scale-110 transition-transform"
        aria-label="Contact us on WhatsApp"
    >
        {/* Icon inside a small green circle */}
        <div className="bg-[#25D366] rounded-full p-1.5 shadow-lg">
            <svg
                width="44"
                height="44"
                viewBox="0 0 24 24"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.35 3.45 16.84L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.02L7.55 18.85L4.43 19.65L5.25 16.61L5.06 16.29C4.24 14.98 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 13.98C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.5 13.06 14.31 13.31C14.15 13.56 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 13 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.48 11.14 9.61 11 9.73 10.87C9.84 10.76 10 10.57 10.1 10.43C10.23 10.28 10.27 10.18 10.35 10.01C10.43 9.84 10.39 9.7 10.33 9.57C10.27 9.44 9.77 8.21 9.56 7.72C9.36 7.23 9.15 7.29 9 7.28C8.86 7.27 8.7 7.26 8.53 7.26V7.33Z" />
            </svg>
        </div>

        {/* "Contact Us" with green border */}
        <span className="text-[11px] font-bold text-[#25D366] whitespace-nowrap border border-[#25D366] rounded-full px-2 py-0.5 bg-white shadow-sm">
            Contact Us
        </span>
    </a>
);

export default WhatsAppButton;
