import { TailSpin } from "react-loader-spinner";

function TailSpinLoader({ size, wrapperClass }) {
  const defaultStyles = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "7%",
  };

  const wrapperStyles = wrapperClass ? {} : defaultStyles;

  return (
    <div style={wrapperStyles}>
      <TailSpin
        height={size}
        width={size}
        color="#4fa94d"
        ariaLabel="tail-spin-loading"
        radius="1"
        visible={true}
        wrapperClass={wrapperClass}
      />
    </div>
  );
}

export default TailSpinLoader;
