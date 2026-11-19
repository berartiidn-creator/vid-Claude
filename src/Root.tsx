import React from "react";
import { Composition } from "remotion";
import { Bumper } from "./Bumper";
import { VIDEO } from "./config/theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="AlBahjahBumper"
      component={Bumper}
      durationInFrames={VIDEO.durationInFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  </>
);
