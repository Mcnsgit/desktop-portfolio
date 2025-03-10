import React from "react";
import { BallCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";
// Memoizing BallCanvas to prevent unnecessary re-renders
const MemoizedBallCanvas = React.memo(BallCanvas);
const Tech = () => {
  return (
    <div className="flex flex-row flex-wrap justify-center gap-10">
      {technologies.map((technology) => (
        <div className="w-28 h-28" key={technology.id}>
          {" "}
          {/* Assuming technology has a unique id */}
          <MemoizedBallCanvas icon={technology.icon} />
        </div>
      ))}
    </div>
  );
};
export default SectionWrapper(Tech, "");
