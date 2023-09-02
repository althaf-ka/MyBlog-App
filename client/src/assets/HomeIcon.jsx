function HomeIcon() {
  return (
    <svg
      fill="none"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 10V20.3a.77.77 0 0 1-.83.7H14.3V14.1H9.7V21H5.83A.77.77 0 0 1 5 20.3V10l7-7Z"
        style={{
          fill: "#449a4a",
          strokeWidth: 2,
        }}
      />
      <path
        d="M19 10V20.3a.77.77 0 0 1-.83.7H14.3V14.1H9.7V21H5.83A.77.77 0 0 1 5 20.3V10"
        style={{
          fill: "none",
          stroke: "rgb(0, 0, 0)",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
        }}
      />
      <polyline
        points="21 12 12 3 3 12"
        style={{
          fill: "none",
          stroke: "rgb(0, 0, 0)",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
        }}
      />
    </svg>
  );
}

export default HomeIcon;
