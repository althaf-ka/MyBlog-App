import { RotatingLines } from "react-loader-spinner";

function RoatingLinesLoader() {
  return (
    <div style={{ paddingRight: "5px" }}>
      <RotatingLines
        strokeColor="grey"
        strokeWidth="4"
        animationDuration="0.75"
        width="20"
        visible={true}
      />
    </div>
  );
}

export default RoatingLinesLoader;
