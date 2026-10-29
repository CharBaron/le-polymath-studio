// Composition générique : charge timeline / sous-titres / bouche depuis public/v/<id>/ et joue la scène enregistrée.
import React from 'react';
import {AbsoluteFill, CalculateMetadataFunction, Html5Audio, staticFile} from 'remotion';
import {BoilFilter, C, Paper} from './theme';
import {Captions, Word} from './components/Captions';
import {Spiral} from './components/Ink';
import {Retention, RetentionSpec} from './components/Retention';

export type Timeline = {fps: number; duration: number; frames: number; beats: Record<string, number>; sections: {id: string; t0: number; t1: number}[]; title: string; retention?: RetentionSpec; hook?: string};
export type VideoData = {id: string; tl?: Timeline; words?: Word[]; talk?: number[]};
export type SceneProps = {tl: Timeline; words: Word[]; talk: number[]};

const get = async (id: string, f: string) => (await fetch(staticFile(`v/${id}/${f}`))).json();

export const calcVideo: CalculateMetadataFunction<VideoData> = async ({props}) => {
  const [tl, words, talk] = await Promise.all([get(props.id, 'timeline.json'), get(props.id, 'captions.json'), get(props.id, 'talk.json')]);
  return {durationInFrames: tl.frames, fps: 30, width: 1080, height: 1920, props: {...props, tl, words, talk}};
};

export const makeVideo = (Scene: React.FC<SceneProps>, opts: {captions?: boolean; bare?: boolean} = {}) => {
  const V: React.FC<VideoData> = ({id, tl, words, talk}) => {
    if (!tl || !words || !talk) return <AbsoluteFill style={{background: opts.bare ? '#0E0D0C' : C.paper}} />;
    if (opts.bare) {
      return (
        <AbsoluteFill style={{background: '#0E0D0C'}}>
          <Scene tl={tl} words={words} talk={talk} />
          <Html5Audio src={staticFile(`v/${id}/mix.wav`)} />
        </AbsoluteFill>
      );
    }
    return (
      <AbsoluteFill style={{background: C.paper}}>
        <Paper />
        <BoilFilter />
        <Spiral />
        <Scene tl={tl} words={words} talk={talk} />
        {opts.captions !== false ? <Captions words={words} /> : null}
        <Retention spec={tl.retention} duration={tl.duration} />
        <Html5Audio src={staticFile(`v/${id}/mix.wav`)} />
      </AbsoluteFill>
    );
  };
  return V;
};
