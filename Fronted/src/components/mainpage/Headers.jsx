// import React from "react";
// import Head from "./Head";
// import HomeNavbar from "./HomeNavbar";

// const Headers = () => {
//   return (
//     <header className="w-full">
//       <Head />
//       <HomeNavbar />
//     </header>
//   );
// };

// export default Headers;


import React from "react";
import Head from "./Head";
import HomeNavbar from "./HomeNavbar";

const Headers = () => {
  return (
    <>
      <header
        className="
          fixed top-0 left-0 w-full z-50
          bg-white/80 backdrop-blur-md shadow-sm
          transition-all duration-300
        "
      >
        <Head />
        <HomeNavbar />
      </header>

      {/* Spacer to push content below the fixed header */}
      <div className="h-[60px]"></div>
    </>
  );
};

export default Headers;
