import React from 'react';
import {Composition} from 'remotion';
import {Looks} from './dev/Looks';
import {Avatar} from './dev/Avatar';
import {calcVideo, makeVideo} from './Video';
import {BARE, VIDEOS} from './videos';
import {Kit} from './kit/Kit';

const KitVideo = makeVideo(Kit);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Looks" component={Looks} durationInFrames={60} fps={30} width={1920} height={1080} defaultProps={{}} />
    <Composition id="Avatar" component={Avatar} durationInFrames={1} fps={30} width={1080} height={1080} defaultProps={{}} />
    {Object.entries(VIDEOS).map(([id, Scene]) => (
      <Composition key={id} id={id} component={makeVideo(Scene, {bare: BARE.has(id)})} durationInFrames={300} fps={30} width={1080} height={1920} defaultProps={{id}} calculateMetadata={calcVideo} />
    ))}
    {/* vidéos sans scène sur mesure : tout vient du kit (script.md > `>> type`) */}
    <Composition id="kit" component={KitVideo} durationInFrames={300} fps={30} width={1080} height={1920} defaultProps={{id: '00-kit-demo'}} calculateMetadata={calcVideo} />
  </>
);
