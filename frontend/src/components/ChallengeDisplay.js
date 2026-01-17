import React from 'react';
import SelectImagesChallenge from './challenges/SelectImagesChallenge';
import ButtonClickChallenge from './challenges/ButtonClickChallenge';
import TextInputChallenge from './challenges/TextInputChallenge';
import SecurityQuestionChallenge from './challenges/SecurityQuestionChallenge';
import DrawCircleChallenge from './challenges/DrawCircleChallenge';
import FillLyricsChallenge from './challenges/FillLyricsChallenge';
import MatchToasterChallenge from './challenges/MatchToasterChallenge';
import SelectSoundChallenge from './challenges/SelectSoundChallenge';
import MovingButtonChallenge from './challenges/MovingButtonChallenge';
import BlinkCameraChallenge from './challenges/BlinkCameraChallenge';
import VoiceRecognitionChallenge from './challenges/VoiceRecognitionChallenge';
import HoldKeyChallenge from './challenges/HoldKeyChallenge';
import TypeSequenceChallenge from './challenges/TypeSequenceChallenge';

function ChallengeDisplay({ challenge, challengeNumber, totalChallenges, userInfo, onVerify }) {
  const renderChallenge = () => {
    switch (challenge.type) {
      case 'select_images':
        return <SelectImagesChallenge challenge={challenge} onVerify={onVerify} />;
      case 'button_click':
        return <ButtonClickChallenge challenge={challenge} onVerify={onVerify} />;
      case 'text_input':
        return <TextInputChallenge challenge={challenge} userInfo={userInfo} onVerify={onVerify} />;
      case 'security_question':
        return <SecurityQuestionChallenge challenge={challenge} onVerify={onVerify} />;
      case 'draw_circle':
        return <DrawCircleChallenge challenge={challenge} onVerify={onVerify} />;
      case 'fill_lyrics':
        return <FillLyricsChallenge challenge={challenge} onVerify={onVerify} />;
      case 'match_personality':
        return <MatchToasterChallenge challenge={challenge} userInfo={userInfo} onVerify={onVerify} />;
      case 'select_sound':
        return <SelectSoundChallenge challenge={challenge} onVerify={onVerify} />;
      case 'moving_button':
        return <MovingButtonChallenge challenge={challenge} onVerify={onVerify} />;
      case 'blink_camera':
        return <BlinkCameraChallenge challenge={challenge} onVerify={onVerify} />;
      case 'voice_recognition':
        return <VoiceRecognitionChallenge challenge={challenge} onVerify={onVerify} />;
      case 'hold_key':
        return <HoldKeyChallenge challenge={challenge} onVerify={onVerify} />;
      case 'type_sequence':
        return <TypeSequenceChallenge challenge={challenge} onVerify={onVerify} />;
      default:
        return <div>Unknown challenge type: {challenge.type}</div>;
    }
  };

  return (
    <div className="challenge-container">
      <div className="challenge-number">
        Verification Step {challengeNumber} of {totalChallenges}
      </div>
      <div className="challenge-title">{challenge.title}</div>
      <div className="challenge-description">{challenge.description}</div>
      {renderChallenge()}
    </div>
  );
}

export default ChallengeDisplay;
