from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import random
import uuid
import json
from datetime import datetime

# In-memory storage for sessions (in production, use a database)
sessions = {}

# Lyrics database by decade (song, lyric with missing word(s), answer)
LYRICS_BY_DECADE = {
    2020: [
        {'song': 'Blinding Lights', 'lyric': 'I been tryna call, I been on my own for long enough', 'missing': 'call', 'full_lyric': 'I been tryna call, I been on my own for long enough'},
        {'song': 'Watermelon Sugar', 'lyric': 'Tastes like strawberries on a summer evenin\'', 'missing': 'strawberries', 'full_lyric': 'Tastes like strawberries on a summer evenin\''},
    ],
    2010: [
        {'song': 'Someone Like You', 'lyric': 'Never mind, I\'ll find someone like you', 'missing': 'you', 'full_lyric': 'Never mind, I\'ll find someone like you'},
        {'song': 'Rolling in the Deep', 'lyric': 'We could have had it all, rolling in the deep', 'missing': 'deep', 'full_lyric': 'We could have had it all, rolling in the deep'},
        {'song': 'Call Me Maybe', 'lyric': 'Hey, I just met you, and this is crazy', 'missing': 'crazy', 'full_lyric': 'Hey, I just met you, and this is crazy'},
    ],
    2000: [
        {'song': 'Hey Ya!', 'lyric': 'Shake it like a Polaroid picture', 'missing': 'Polaroid', 'full_lyric': 'Shake it like a Polaroid picture'},
        {'song': 'I\'m a Believer', 'lyric': 'I thought love was only true in fairy tales', 'missing': 'fairy', 'full_lyric': 'I thought love was only true in fairy tales'},
        {'song': 'Complicated', 'lyric': 'Why\'d you have to go and make things so complicated?', 'missing': 'complicated', 'full_lyric': 'Why\'d you have to go and make things so complicated?'},
    ],
    1990: [
        {'song': 'Wonderwall', 'lyric': 'Today is gonna be the day that they\'re gonna throw it back to you', 'missing': 'day', 'full_lyric': 'Today is gonna be the day that they\'re gonna throw it back to you'},
        {'song': 'Smells Like Teen Spirit', 'lyric': 'Here we are now, entertain us', 'missing': 'entertain', 'full_lyric': 'Here we are now, entertain us'},
        {'song': 'I Will Always Love You', 'lyric': 'And I will always love you', 'missing': 'always', 'full_lyric': 'And I will always love you'},
    ],
    1980: [
        {'song': 'Billie Jean', 'lyric': 'Billie Jean is not my lover', 'missing': 'lover', 'full_lyric': 'Billie Jean is not my lover'},
        {'song': 'Sweet Dreams', 'lyric': 'Sweet dreams are made of this', 'missing': 'this', 'full_lyric': 'Sweet dreams are made of this'},
        {'song': 'Take On Me', 'lyric': 'Take on me, take me on', 'missing': 'on', 'full_lyric': 'Take on me, take me on'},
    ],
    1970: [
        {'song': 'Bohemian Rhapsody', 'lyric': 'Is this the real life? Is this just fantasy?', 'missing': 'fantasy', 'full_lyric': 'Is this the real life? Is this just fantasy?'},
        {'song': 'Hotel California', 'lyric': 'Welcome to the Hotel California', 'missing': 'California', 'full_lyric': 'Welcome to the Hotel California'},
        {'song': 'Stairway to Heaven', 'lyric': 'And she\'s buying a stairway to heaven', 'missing': 'heaven', 'full_lyric': 'And she\'s buying a stairway to heaven'},
    ],
    1960: [
        {'song': 'Hey Jude', 'lyric': 'Hey Jude, don\'t be afraid', 'missing': 'afraid', 'full_lyric': 'Hey Jude, don\'t be afraid'},
        {'song': 'Let It Be', 'lyric': 'Let it be, let it be', 'missing': 'be', 'full_lyric': 'Let it be, let it be'},
        {'song': 'I Can\'t Get No Satisfaction', 'lyric': 'I can\'t get no satisfaction', 'missing': 'satisfaction', 'full_lyric': 'I can\'t get no satisfaction'},
    ],
}

def get_birth_decade(age):
    """Calculate birth decade from age"""
    current_year = datetime.now().year
    birth_year = current_year - int(age) if age else current_year - 25
    # Round down to nearest decade
    decade = (birth_year // 10) * 10
    # Clamp to available decades
    available_decades = sorted(LYRICS_BY_DECADE.keys())
    if decade < min(available_decades):
        return min(available_decades)
    if decade > max(available_decades):
        return max(available_decades)
    # Find closest decade
    closest = min(available_decades, key=lambda x: abs(x - decade))
    return closest

def get_lyric_challenge(birth_decade):
    """Get a random lyric challenge for the given decade"""
    if birth_decade not in LYRICS_BY_DECADE:
        birth_decade = 2000  # Default
    lyrics = LYRICS_BY_DECADE[birth_decade]
    lyric_data = random.choice(lyrics)
    
    # Create lyric with missing word(s) - replace the missing word with blank
    lyric_with_blank = lyric_data['lyric'].replace(lyric_data['missing'], '_____')
    
    return {
        'song': lyric_data['song'],
        'lyric': lyric_with_blank,
        'answer': lyric_data['missing'].lower(),
        'full_answer': lyric_data['missing'],
    }

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
            'description': 'Prove you are human by drawing a perfect circle.',
        },
        {
            'id': 'fill_lyrics',
            'type': 'fill_lyrics',
            'title': 'Complete the lyric',
            'description': 'Fill in the missing word(s) from a popular song from your birth decade.',
            # Will be populated dynamically based on user's birth year
        },
        {
            'id': 'match_toaster',
            'type': 'match_personality',
            'title': 'Match your personality to a toaster',
            'description': 'Select the toaster that best matches your personality.',
            # Will be populated dynamically with all personality options
            'toasters': []
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
            'title': 'Blink at the camera once',
            'description': 'Please blink at your camera exactly 7 times to verify your humanity.',
            'required_blinks': 1,
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
    
    # Populate first challenge if it needs dynamic data
    first_challenge = challenge_sequence[0] if challenge_sequence else None
    if first_challenge:
        # Populate match_personality challenge
        if first_challenge.get('type') == 'match_personality':
            user_personality = user_info.get('personality', '')
            all_personalities = ['Traditional', 'Modern', 'Bold', 'Tech-savvy', 'Quirky', 'Mysterious']
            toaster_names = {
                'Traditional': 'Classic White',
                'Modern': 'Stainless Steel',
                'Bold': 'Retro Red',
                'Tech-savvy': 'Smart Toaster',
                'Quirky': 'Rainbow Toaster',
                'Mysterious': 'Black Toaster'
            }
            
            toasters = []
            for idx, personality in enumerate(all_personalities, 1):
                toasters.append({
                    'id': idx,
                    'name': toaster_names.get(personality, personality + ' Toaster'),
                    'personality': personality
                })
            
            first_challenge['toasters'] = toasters
            first_challenge['correct_personality'] = user_personality
        
        # Populate fill_lyrics challenge
        elif first_challenge.get('type') == 'fill_lyrics':
            user_age = user_info.get('age')
            if user_age:
                birth_decade = get_birth_decade(user_age)
                lyric_challenge = get_lyric_challenge(birth_decade)
                first_challenge['lyric'] = lyric_challenge['lyric']
                first_challenge['song'] = lyric_challenge['song']
                first_challenge['answer'] = lyric_challenge['answer']
                first_challenge['full_answer'] = lyric_challenge['full_answer']
                first_challenge['description'] = f'Fill in the missing word from "{lyric_challenge["song"]}" (a popular song from the {birth_decade}s).'
    
    return Response({
        'session_id': session_id,
        'total_challenges': len(challenge_sequence),
        'first_challenge': first_challenge,
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
    
    challenge = session['challenges'][current_idx].copy()
    
    # Populate match_personality challenge dynamically with all personality options
    if challenge.get('type') == 'match_personality' and (not challenge.get('toasters') or len(challenge.get('toasters', [])) == 0):
        user_personality = session['user_info'].get('personality', '')
        # All personality options from the form
        all_personalities = ['Traditional', 'Modern', 'Bold', 'Tech-savvy', 'Quirky', 'Mysterious']
        toaster_names = {
            'Traditional': 'Classic White',
            'Modern': 'Stainless Steel',
            'Bold': 'Retro Red',
            'Tech-savvy': 'Smart Toaster',
            'Quirky': 'Rainbow Toaster',
            'Mysterious': 'Black Toaster'
        }
        
        toasters = []
        for idx, personality in enumerate(all_personalities, 1):
            toasters.append({
                'id': idx,
                'name': toaster_names.get(personality, personality + ' Toaster'),
                'personality': personality
            })
        
        challenge['toasters'] = toasters
        challenge['correct_personality'] = user_personality  # Store the correct answer
        session['challenges'][current_idx].update(challenge)
    
    # Populate fill_lyrics challenge dynamically based on user's age
    if challenge.get('type') == 'fill_lyrics' and not challenge.get('lyric'):
        user_age = session['user_info'].get('age')
        if user_age:
            birth_decade = get_birth_decade(user_age)
            lyric_challenge = get_lyric_challenge(birth_decade)
            challenge['lyric'] = lyric_challenge['lyric']
            challenge['song'] = lyric_challenge['song']
            challenge['answer'] = lyric_challenge['answer']
            challenge['full_answer'] = lyric_challenge['full_answer']
            challenge['description'] = f'Fill in the missing word from "{lyric_challenge["song"]}" (a popular song from the {birth_decade}s).'
            # Update the challenge in the session too
            session['challenges'][current_idx].update(challenge)
        else:
            # Default if no age provided
            birth_decade = 2000
            lyric_challenge = get_lyric_challenge(birth_decade)
            challenge['lyric'] = lyric_challenge['lyric']
            challenge['song'] = lyric_challenge['song']
            challenge['answer'] = lyric_challenge['answer']
            challenge['full_answer'] = lyric_challenge['full_answer']
            challenge['description'] = f'Fill in the missing word from "{lyric_challenge["song"]}" (a popular song from the {birth_decade}s).'
            # Update the challenge in the session too
            session['challenges'][current_idx].update(challenge)
    
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
        user_name = session['user_info'].get('name', '').lower().strip()
        entered_name = attempt_data.get('text', '').lower().strip()
        attempts = attempt_data.get('attempts', 1)
        
        if challenge.get('attempts_required', 1) == 2:
            # Succeeds if name matches OR on second attempt
            name_matches = user_name == entered_name
            success = name_matches or attempts >= 2
            if name_matches:
                message = 'Name verification successful. Please proceed.'
            elif attempts >= 2:
                message = 'Name verification complete. Proceeding with caution.'
            else:
                message = 'Please try again. System requires additional verification.'
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
        answer = attempt_data.get('answer', '').lower().strip()
        correct_answer = challenge.get('answer', '').lower().strip()
        # Check if answer matches (case-insensitive, allow partial matches)
        success = answer == correct_answer or correct_answer in answer or answer in correct_answer
        if not success and len(answer) > 2:
            # Very lenient fallback - any reasonable answer works
            success = True
        message = 'Lyric completion accepted. Cultural verification: pending.' if success else 'Incorrect answer. Please try again.'
    
    elif challenge['type'] == 'match_personality':
        selected_toaster_id = attempt_data.get('toaster_id')
        correct_personality = challenge.get('correct_personality', '').lower()
        
        # Find the selected toaster
        selected_toaster = None
        for toaster in challenge.get('toasters', []):
            if toaster['id'] == selected_toaster_id:
                selected_toaster = toaster
                break
        
        if selected_toaster:
            selected_personality = selected_toaster.get('personality', '').lower()
            success = selected_personality == correct_personality
            message = 'Personality-to-toaster matching complete. Compatibility: questionable.' if success else 'Personality mismatch detected. Please try again.'
        else:
            success = False
            message = 'Invalid selection. Please try again.'
    
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
        next_challenge = session['challenges'][session['current_challenge']].copy()
        
        # Populate match_personality challenge if needed
        if next_challenge.get('type') == 'match_personality' and (not next_challenge.get('toasters') or len(next_challenge.get('toasters', [])) == 0):
            user_personality = session['user_info'].get('personality', '')
            all_personalities = ['Traditional', 'Modern', 'Bold', 'Tech-savvy', 'Quirky', 'Mysterious']
            toaster_names = {
                'Traditional': 'Classic White',
                'Modern': 'Stainless Steel',
                'Bold': 'Retro Red',
                'Tech-savvy': 'Smart Toaster',
                'Quirky': 'Rainbow Toaster',
                'Mysterious': 'Black Toaster'
            }
            
            toasters = []
            for idx, personality in enumerate(all_personalities, 1):
                toasters.append({
                    'id': idx,
                    'name': toaster_names.get(personality, personality + ' Toaster'),
                    'personality': personality
                })
            
            next_challenge['toasters'] = toasters
            next_challenge['correct_personality'] = user_personality
            session['challenges'][session['current_challenge']].update(next_challenge)
        
        # Populate fill_lyrics challenge if needed
        if next_challenge.get('type') == 'fill_lyrics' and not next_challenge.get('lyric'):
            user_age = session['user_info'].get('age')
            if user_age:
                birth_decade = get_birth_decade(user_age)
                lyric_challenge = get_lyric_challenge(birth_decade)
                next_challenge['lyric'] = lyric_challenge['lyric']
                next_challenge['song'] = lyric_challenge['song']
                next_challenge['answer'] = lyric_challenge['answer']
                next_challenge['full_answer'] = lyric_challenge['full_answer']
                next_challenge['description'] = f'Fill in the missing word from "{lyric_challenge["song"]}" (a popular song from the {birth_decade}s).'
                # Update the challenge in the session too
                session['challenges'][session['current_challenge']].update(next_challenge)
            else:
                # Default if no age provided
                birth_decade = 2000
                lyric_challenge = get_lyric_challenge(birth_decade)
                next_challenge['lyric'] = lyric_challenge['lyric']
                next_challenge['song'] = lyric_challenge['song']
                next_challenge['answer'] = lyric_challenge['answer']
                next_challenge['full_answer'] = lyric_challenge['full_answer']
                next_challenge['description'] = f'Fill in the missing word from "{lyric_challenge["song"]}" (a popular song from the {birth_decade}s).'
                # Update the challenge in the session too
                session['challenges'][session['current_challenge']].update(next_challenge)
    
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
