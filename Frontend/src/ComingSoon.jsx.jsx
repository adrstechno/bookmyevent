// // import React from "react";

// // const ComingSoon = () => {
// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-white px-4">
// //       <div className="text-center relative">
// //         {/* Soft background accent */}
// //         <div className="absolute inset-0 -z-10 flex items-center justify-center">
// //           <div className="w-72 h-72 rounded-full bg-gray-100 blur-3xl"></div>
// //         </div>

// //         {/* Brand */}
// //         <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6 tracking-wider">
// //           GoEventify
// //         </h1>

// //         {/* Coming Soon Banner */}
// //         <div className="inline-block border border-gray-300 px-8 py-5 rounded-xl shadow-sm">
// //           <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-wide mb-2">
// //             COMING SOON
// //           </h2>
// //           <div className="w-16 h-[2px] bg-gray-400 mx-auto mb-3"></div>
// //           <p className="text-sm md:text-base text-gray-500 tracking-wide">
// //             Something refined is on its way
// //           </p>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ComingSoon;

// import React from "react";

// const ComingSoon = () => {
//   return (
//     <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden px-4">

//       {/* Elegant Gradient Lines (Stage-light feel) */}
//       <div className="absolute left-0 top-0 h-full w-1/3 pointer-events-none">
//         <div className="absolute top-0 left-16 h-full w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
//         <div className="absolute top-0 left-28 h-full w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
//       </div>

//       <div className="absolute right-0 top-0 h-full w-1/3 pointer-events-none">
//         <div className="absolute top-0 right-16 h-full w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
//         <div className="absolute top-0 right-28 h-full w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
//       </div>

//       {/* Center Content */}
//       <div className="relative z-10 text-center max-w-xl">

//         {/* Soft glow */}
//         <div className="absolute inset-0 -z-10 flex items-center justify-center">
//           <div className="w-96 h-96 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 blur-3xl"></div>
//         </div>

//         {/* Brand */}
//         <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-widest mb-3">
//           GoEventify
//         </h1>

//         <p className="text-xs tracking-[0.35em] text-gray-500 uppercase mb-10">
//           Designed for Exceptional Events
//         </p>

//         {/* Highlight Card */}
//         <div className="relative bg-white rounded-3xl px-12 py-12 shadow-xl border border-gray-200">

//           {/* Accent top line */}
//           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[3px] bg-gray-800 rounded-full"></div>

//           <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-wide mb-5">
//             Coming Soon
//           </h2>

//           <p className="text-gray-600 text-base md:text-lg leading-relaxed">
//             A modern platform built to simplify event planning while maintaining
//             elegance, precision, and complete control —
//             from intimate gatherings to grand celebrations.
//           </p>

//           <div className="mt-10 inline-flex items-center gap-3 px-8 py-3 
//             border border-gray-800 rounded-full text-sm font-medium tracking-wide">
//             Launching Shortly
//             <span className="w-2 h-2 bg-gray-800 rounded-full"></span>
//           </div>
//         </div>

//         {/* Bottom line */}
//         <p className="mt-8 text-sm text-gray-500 tracking-wide">
//           Weddings · Corporate · Concerts · Experiences
//         </p>
//       </div>

//       {/* Subtle background word */}
//       <div className="absolute bottom-6 text-gray-100 text-9xl font-bold tracking-widest select-none">
//         EVENTS
//       </div>
//     </div>
//   );
// };

// export default ComingSoon;
import React from "react";
import Snowfall from "react-snowfall";

const ComingSoon = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] relative overflow-hidden px-4">

      {/* Multicolor Snowfall (Professional Event Confetti) */}
      <Snowfall
        snowflakeCount={90}
        radius={[0.8, 1.8]}
        speed={[0.5, 1.3]}
        wind={[-0.3, 0.3]}
        color={[
          "#6366f1", // indigo
          "#818cf8", // soft blue
          "#94a3b8", // slate
          "#c7d2fe", // light indigo
          "#e2e8f0", // soft gray
          "#bae6fd", // light sky
          "#bbf7d0", // light green
          "#fde68a", // soft amber
          "#fecaca", // soft rose
        ]}
      />

      {/* Subtle background accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-slate-200 rounded-full blur-3xl opacity-40"></div>

      <div className="relative z-10 w-full max-w-xl text-center">

        {/* Brand */}
        <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-wide mb-4">
          GoEventify
        </h1>

        <p className="text-sm text-slate-500 tracking-widest uppercase mb-12">
          Event Management Platform
        </p>

        {/* Main Banner */}
        <div className="relative bg-white rounded-2xl px-10 py-12 shadow-lg border border-slate-200">

          {/* Soft top accent */}
          <div className="absolute top-0 left-0 w-full h-1 
            bg-gradient-to-r from-indigo-400 via-slate-400 to-indigo-400 
            rounded-t-2xl">
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-wide mb-4">
            Coming Soon
          </h2>

          <div className="w-16 h-[2px] bg-gradient-to-r from-indigo-300 to-slate-300 mx-auto mb-6"></div>

          <p className="text-slate-600 text-base md:text-lg leading-relaxed">
            We are building a refined and reliable platform to help you plan,
            organize, and manage events with ease — from weddings to corporate
            gatherings and special occasions.
          </p>

          <div className="mt-10 inline-flex items-center px-8 py-3 
            rounded-full border border-indigo-400 text-indigo-600 
            text-sm font-medium tracking-wide hover:bg-indigo-50 transition">
            Launching Soon
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-sm text-slate-500 tracking-wide">
          Weddings · Corporate · Celebrations
        </p>

      </div>
    </div>
  );
};

export default ComingSoon;
