import React from 'react';
import {Composition, Still} from 'remotion';
import {Cover, CoverGuides, Reel} from './reel';
import project from './project.json';

export const Root: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel} width={1080} height={1920} fps={30} durationInFrames={Math.ceil(project.durationSeconds * 30)} />
    <Still id="Cover" component={Cover} width={1080} height={1920} />
    <Still id="CoverGuides" component={CoverGuides} width={1080} height={1920} />
  </>
);
