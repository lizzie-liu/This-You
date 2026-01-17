from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import random
import uuid
import json

# In-memory storage for sessions (in production, use a database)
sessions = {}

# Challenge definitions
CHALLENGES = {
    'semi_serious': [
        {
            'id': 'click_this_is_me',
            'type': 'button_click',
            'title': 'Click "This is me" button',
            'description': 'Please click the button below to confirm your identity.',
        },
        {
            'id': 'enter_name',
            'type': 'text_input',
            'title': 'Enter your name',
            'description': 'Please enter the name you provided earlier.',
            'field_name': 'name',
            'attempts_required': 2,
        },
        {
            'id': 'security_question',
            'type': 'security_question',
            'title': 'Answer your security question',
            'description': 'Please answer the security question you definitely remember setting.',
            'question': 'What was the name of your first pet\'s favorite color?',
        },
    ],
    'silly': [
        {
            'id': 'draw_circle',
            'type': 'draw_circle',
            'title': 'Draw a perfect circle',
            'description': 'Prove you are human by drawing a perfect circle in 3 seconds.',
            'time_limit': 3,
        },
        {
            'id': 'national_anthem',
            'type': 'fill_lyrics',
            'title': 'Complete the national anthem',
            'description': 'Please complete the following lyric from your national anthem.',
            'lyric': 'O say can you see, by the dawn\'s early light,',
            'answer': 'What so proudly we hailed at the twilight\'s last gleaming',
        },
        {
            'id': 'match_toaster',
            'type': 'match_personality',
            'title': 'Match your personality to a toaster',
            'description': 'Select the toaster that best matches your personality.',
            'toasters': [
                {'id': 1, 'name': 'Classic White', 'personality': 'Traditional'},
                {'id': 2, 'name': 'Stainless Steel', 'personality': 'Modern'},
                {'id': 3, 'name': 'Retro Red', 'personality': 'Bold'},
                {'id': 4, 'name': 'Smart Toaster', 'personality': 'Tech-savvy'},
            ]
        },
        {
            'id': 'funniest_sound',
            'type': 'select_sound',
            'title': 'Choose the funniest sound effect',
            'description': 'Confirm your identity by selecting the funniest sound effect.',
            'sounds': [
                {'id': 1, 'name': 'Bloop', 'file': '/api/static/sounds/bloop.mp3'},
                {'id': 2, 'name': 'Boing', 'file': '/api/static/sounds/boing.mp3'},
                {'id': 3, 'name': 'Honk', 'file': '/api/static/sounds/honk.mp3'},
                {'id': 4, 'name': 'Squeak', 'file': '/api/static/sounds/squeak.mp3'},
            ]
        },
        {
            'id': 'moving_button',
            'type': 'moving_button',
            'title': 'Click this button to confirm',
            'description': 'Please click the button below to confirm your identity.',
        },
    ],
    'physical': [
        {
            'id': 'blink_camera',
            'type': 'blink_camera',
            'title': 'Blink at the camera exactly 7 times',
            'description': 'Please blink at your camera exactly 7 times to verify your humanity.',
            'required_blinks': 7,
        },
        {
            'id': 'say_this_is_me',
            'type': 'voice_recognition',
            'title': 'Say "this is me" out loud',
            'description': 'Please say "this is me" out loud and press continue.',
            'required_phrase': 'this is me',
        },
        {
            'id': 'hold_spacebar',
            'type': 'hold_key',
            'title': 'Hold spacebar to demonstrate commitment',
            'description': 'Please hold the spacebar key for 3 seconds to demonstrate your commitment.',
            'key': 'space',
            'duration': 3,
        },
        {
            'id': 'type_alphabet',
            'type': 'type_sequence',
            'title': 'Type the alphabet',
            'description': 'Please type the alphabet from A to Z to verify your identity.',
            'sequence': 'abcdefghijklmnopqrstuvwxyz',
        },
    ],
}

@api_view(['POST'])
def start_session(request):
    """Start a new verification session"""
    session_id = str(uuid.uuid4())
    user_info = request.data.get('user_info', {})
    
    # Include ALL challenges
    challenge_sequence = []
    challenge_sequence.extend(CHALLENGES['semi_serious'])
    challenge_sequence.extend(CHALLENGES['silly'])
    challenge_sequence.extend(CHALLENGES['physical'])
    
    sessions[session_id] = {
        'user_info': user_info,
        'challenges': challenge_sequence,
        'current_challenge': 0,
        'results': [],
        'confidence_level': 0,
    }
    
    return Response({
        'session_id': session_id,
        'total_challenges': len(challenge_sequence),
        'first_challenge': challenge_sequence[0] if challenge_sequence else None,
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_challenges(request):
    """Get the current challenge for a session"""
    session_id = request.query_params.get('session_id')
    
    if not session_id or session_id not in sessions:
        return Response({'error': 'Invalid session'}, status=status.HTTP_400_BAD_REQUEST)
    
    session = sessions[session_id]
    current_idx = session['current_challenge']
    
    if current_idx >= len(session['challenges']):
        return Response({'error': 'All challenges completed'}, status=status.HTTP_400_BAD_REQUEST)
    
    challenge = session['challenges'][current_idx]
    return Response({
        'challenge': challenge,
        'challenge_number': current_idx + 1,
        'total_challenges': len(session['challenges']),
        'confidence_level': session['confidence_level'],
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
def verify_challenge(request):
    """Verify a challenge attempt"""
    session_id = request.data.get('session_id')
    attempt_data = request.data.get('attempt_data', {})
    
    if not session_id or session_id not in sessions:
        return Response({'error': 'Invalid session'}, status=status.HTTP_400_BAD_REQUEST)
    
    session = sessions[session_id]
    current_idx = session['current_challenge']
    
    if current_idx >= len(session['challenges']):
        return Response({'error': 'All challenges completed'}, status=status.HTTP_400_BAD_REQUEST)
    
    challenge = session['challenges'][current_idx]
    success = False
    message = ''
    
    # Verify based on challenge type
    if challenge['type'] == 'select_images':
        selected = attempt_data.get('selected', [])
        correct = [img['id'] for img in challenge['images'] if img['has_vibes']]
        success = set(selected) == set(correct)
        message = 'Thank you for your cooperation. That was deeply insufficient.' if not success else 'Verification successful. Proceeding with caution.'
    
    elif challenge['type'] == 'button_click':
        success = attempt_data.get('clicked', False)
        message = 'Button click registered. Identity confirmed with moderate certainty.'
    
    elif challenge['type'] == 'text_input':
        user_name = session['user_info'].get('name', '').lower()
        entered_name = attempt_data.get('text', '').lower()
        attempts = attempt_data.get('attempts', 1)
        
        if challenge.get('attempts_required', 1) == 2:
            success = attempts >= 2  # Succeeds on second attempt regardless
            message = 'Name verification successful. Please proceed.' if success else 'Please try again. System requires additional verification.'
        else:
            success = user_name == entered_name
            message = 'Name verified.' if success else 'Name mismatch detected.'
    
    elif challenge['type'] == 'security_question':
        # Always succeeds with any answer
        success = bool(attempt_data.get('answer', ''))
        message = 'Security question answered. Verification status: ambiguous.'
    
    elif challenge['type'] == 'draw_circle':
        # Check if circle is "perfect" (very lenient)
        circle_data = attempt_data.get('circle_data', {})
        success = circle_data.get('is_circle', False) or attempt_data.get('used_premade', False)
        message = 'Circle verification complete. Shape analysis: inconclusive.' if success else 'Circle verification failed. Please attempt to draw a more circular circle.'
    
    elif challenge['type'] == 'fill_lyrics':
        answer = attempt_data.get('answer', '').lower()
        # Very lenient - any answer works
        success = len(answer) > 5
        message = 'Lyric completion accepted. Cultural verification: pending.'
    
    elif challenge['type'] == 'match_personality':
        # Any selection works
        success = attempt_data.get('toaster_id') is not None
        message = 'Personality-to-toaster matching complete. Compatibility: questionable.'
    
    elif challenge['type'] == 'select_sound':
        # Any sound selection works
        success = attempt_data.get('sound_id') is not None
        message = 'Sound selection registered. Humor verification: subjective.'
    
    elif challenge['type'] == 'moving_button':
        success = attempt_data.get('clicked', False)
        message = 'Moving button successfully clicked. Agility confirmed.'
    
    elif challenge['type'] == 'blink_camera':
        blink_count = attempt_data.get('blink_count', 0)
        required = challenge.get('required_blinks', 7)
        success = abs(blink_count - required) <= 1  # Allow 1 off
        message = f'Blink count: {blink_count}. Required: {required}. Verification: {"successful" if success else "suspicious"}.'
    
    elif challenge['type'] == 'voice_recognition':
        phrase = attempt_data.get('phrase', '').lower()
        required = challenge.get('required_phrase', 'this is me').lower()
        success = required in phrase or len(phrase) > 5  # Lenient
        message = 'Voice recognition complete. Audio analysis: inconclusive.'
    
    elif challenge['type'] == 'hold_key':
        duration = attempt_data.get('duration', 0)
        required = challenge.get('duration', 3)
        success = duration >= required
        message = f'Key hold duration: {duration}s. Commitment level: {"adequate" if success else "insufficient"}.'
    
    elif challenge['type'] == 'type_sequence':
        typed = attempt_data.get('typed', '').lower().replace(' ', '')
        required = challenge.get('sequence', 'abcdefghijklmnopqrstuvwxyz')
        success = typed == required or len(typed) >= 20  # Lenient
        message = 'Alphabet typing verification complete. Keyboard proficiency: noted.'
    
    # Update session
    session['results'].append({
        'challenge_id': challenge['id'],
        'success': success,
        'message': message,
    })
    
    if success:
        session['confidence_level'] = min(100, session['confidence_level'] + random.randint(15, 25))
    else:
        session['confidence_level'] = max(0, session['confidence_level'] - random.randint(5, 15))
    
    session['current_challenge'] += 1
    
    next_challenge = None
    if session['current_challenge'] < len(session['challenges']):
        next_challenge = session['challenges'][session['current_challenge']]
    
    return Response({
        'success': success,
        'message': message,
        'confidence_level': session['confidence_level'],
        'next_challenge': next_challenge,
        'challenge_number': session['current_challenge'] + 1 if next_challenge else None,
        'total_challenges': len(session['challenges']),
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
def complete_session(request, session_id):
    """Complete a session and get final verdict"""
    if session_id not in sessions:
        return Response({'error': 'Invalid session'}, status=status.HTTP_400_BAD_REQUEST)
    
    session = sessions[session_id]
    confidence = session['confidence_level']
    successes = sum(1 for r in session['results'] if r['success'])
    total = len(session['results'])
    
    # Determine verdict
    if confidence >= 90 and successes == total:
        verdict = 'Verified'
        title = f'Certified Entity: {session["user_info"].get("name", "Unknown")}'
    elif confidence >= 60:
        verdict = 'Probably You'
        title = f'Alleged Person: {session["user_info"].get("name", "Unknown")}'
    elif confidence >= 30:
        verdict = 'Suspiciously You-Like'
        title = f'Questionable Entity: {session["user_info"].get("name", "Unknown")}'
    else:
        verdict = 'Absolutely Not You'
        title = f'Impostor Suspect: {session["user_info"].get("name", "Unknown")}'
    
    # Clean up session
    result = {
        'verdict': verdict,
        'title': title,
        'confidence_level': confidence,
        'successes': successes,
        'total': total,
    }
    
    del sessions[session_id]
    
    return Response(result, status=status.HTTP_200_OK)
