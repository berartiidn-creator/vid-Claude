import React from "react";
import { Composition } from "remotion";
import { Bumper } from "./Bumper";
import { VIDEO } from "./config/theme";
import { KeyVisualAnimated } from "./keyvisual/KeyVisualAnimated";
import { KV } from "./keyvisual/config";

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
    <Composition
      id="AlBahjahKeyVisual10s"
      component={KeyVisualAnimated}
      durationInFrames={KV.durationSeconds * KV.fps}
      fps={KV.fps}
      width={1920}
      height={1080}
    />
  </>
);
