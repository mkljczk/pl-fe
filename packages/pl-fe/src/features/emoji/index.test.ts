import emojify from '.';

describe('emoji', () => {
  describe('.emojify', () => {
    it('ignores unknown shortcodes', () => {
      expect(emojify(':foobarbazfake:')).toEqual(':foobarbazfake:');
    });

    it('ignores shortcodes inside of tags', () => {
      expect(emojify('<p data-foo=":smile:"></p>')).toEqual(
        '<p data-foo=":smile:"></p>',
      );
    });

    it('works with unclosed tags', () => {
      expect(emojify('hello>')).toEqual('hello>');
      expect(emojify('<hello')).toEqual('<hello');
    });

    it('works with unclosed shortcodes', () => {
      expect(emojify('smile:')).toEqual('smile:');
      expect(emojify(':smile')).toEqual(':smile');
    });

    it('does unicode', () => {
      expect(
        emojify(
          '\uD83D\uDC69\u200D\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66',
        ),
      ).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍👩‍👦‍👦" title=":woman-woman-boy-boy:" src="/packs/emoji/1f469-200d-1f469-200d-1f466-200d-1f466.svg" />',
      );
      expect(emojify('👨‍👩‍👧‍👧')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍👩‍👧‍👧" title=":man-woman-girl-girl:" src="/packs/emoji/1f468-200d-1f469-200d-1f467-200d-1f467.svg" />',
      );
      expect(emojify('👩‍👩‍👦')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍👩‍👦" title=":woman-woman-boy:" src="/packs/emoji/1f469-200d-1f469-200d-1f466.svg" />',
      );
      expect(emojify('\u2757')).toEqual(
        '<img draggable="false" class="emojione" alt="❗" title=":exclamation:" src="/packs/emoji/2757.svg" />',
      );
    });

    it('does multiple unicode', () => {
      expect(emojify('\u2757 #\uFE0F\u20E3')).toEqual(
        '<img draggable="false" class="emojione" alt="❗" title=":exclamation:" src="/packs/emoji/2757.svg" /> <img draggable="false" class="emojione" alt="#️⃣" title=":hash:" src="/packs/emoji/23-20e3.svg" />',
      );
      expect(emojify('\u2757#\uFE0F\u20E3')).toEqual(
        '<img draggable="false" class="emojione" alt="❗" title=":exclamation:" src="/packs/emoji/2757.svg" /><img draggable="false" class="emojione" alt="#️⃣" title=":hash:" src="/packs/emoji/23-20e3.svg" />',
      );
      expect(emojify('\u2757 #\uFE0F\u20E3 \u2757')).toEqual(
        '<img draggable="false" class="emojione" alt="❗" title=":exclamation:" src="/packs/emoji/2757.svg" /> <img draggable="false" class="emojione" alt="#️⃣" title=":hash:" src="/packs/emoji/23-20e3.svg" /> <img draggable="false" class="emojione" alt="❗" title=":exclamation:" src="/packs/emoji/2757.svg" />',
      );
      expect(emojify('foo \u2757 #\uFE0F\u20E3 bar')).toEqual(
        'foo <img draggable="false" class="emojione" alt="❗" title=":exclamation:" src="/packs/emoji/2757.svg" /> <img draggable="false" class="emojione" alt="#️⃣" title=":hash:" src="/packs/emoji/23-20e3.svg" /> bar',
      );
    });

    it('ignores unicode inside of tags', () => {
      expect(
        emojify('<p data-foo="\uD83D\uDC69\uD83D\uDC69\uD83D\uDC66"></p>'),
      ).toEqual('<p data-foo="\uD83D\uDC69\uD83D\uDC69\uD83D\uDC66"></p>');
    });

    it('does multiple emoji properly (issue 5188)', () => {
      expect(emojify('👌🌈💕')).toEqual(
        '<img draggable="false" class="emojione" alt="👌" title=":ok_hand:" src="/packs/emoji/1f44c.svg" /><img draggable="false" class="emojione" alt="🌈" title=":rainbow:" src="/packs/emoji/1f308.svg" /><img draggable="false" class="emojione" alt="💕" title=":two_hearts:" src="/packs/emoji/1f495.svg" />',
      );
      expect(emojify('👌 🌈 💕')).toEqual(
        '<img draggable="false" class="emojione" alt="👌" title=":ok_hand:" src="/packs/emoji/1f44c.svg" /> <img draggable="false" class="emojione" alt="🌈" title=":rainbow:" src="/packs/emoji/1f308.svg" /> <img draggable="false" class="emojione" alt="💕" title=":two_hearts:" src="/packs/emoji/1f495.svg" />',
      );
    });

    it('does an emoji that has no shortcode', () => {
      expect(emojify('👁‍🗨')).toEqual(
        '<img draggable="false" class="emojione" alt="👁‍🗨" title=":eye-in-speech-bubble:" src="/packs/emoji/1f441-200d-1f5e8.svg" />',
      );
    });

    it('skips the textual presentation VS15 character', () => {
      expect(emojify('✴︎')) // This is U+2734 EIGHT POINTED BLACK STAR then U+FE0E VARIATION SELECTOR-15
        .toEqual(
          '<img draggable="false" class="emojione" alt="✴️" title=":eight_pointed_black_star:" src="/packs/emoji/2734.svg" />',
        );
    });

    it('full v14 unicode emoji map', () => {
      expect(emojify('💯')).toEqual(
        '<img draggable="false" class="emojione" alt="💯" title=":100:" src="/packs/emoji/1f4af.svg" />',
      );
      expect(emojify('🔢')).toEqual(
        '<img draggable="false" class="emojione" alt="🔢" title=":1234:" src="/packs/emoji/1f522.svg" />',
      );
      expect(emojify('😀')).toEqual(
        '<img draggable="false" class="emojione" alt="😀" title=":grinning:" src="/packs/emoji/1f600.svg" />',
      );
      expect(emojify('😃')).toEqual(
        '<img draggable="false" class="emojione" alt="😃" title=":smiley:" src="/packs/emoji/1f603.svg" />',
      );
      expect(emojify('😄')).toEqual(
        '<img draggable="false" class="emojione" alt="😄" title=":smile:" src="/packs/emoji/1f604.svg" />',
      );
      expect(emojify('😁')).toEqual(
        '<img draggable="false" class="emojione" alt="😁" title=":grin:" src="/packs/emoji/1f601.svg" />',
      );
      expect(emojify('😆')).toEqual(
        '<img draggable="false" class="emojione" alt="😆" title=":laughing:" src="/packs/emoji/1f606.svg" />',
      );
      expect(emojify('😅')).toEqual(
        '<img draggable="false" class="emojione" alt="😅" title=":sweat_smile:" src="/packs/emoji/1f605.svg" />',
      );
      expect(emojify('🤣')).toEqual(
        '<img draggable="false" class="emojione" alt="🤣" title=":rolling_on_the_floor_laughing:" src="/packs/emoji/1f923.svg" />',
      );
      expect(emojify('😂')).toEqual(
        '<img draggable="false" class="emojione" alt="😂" title=":joy:" src="/packs/emoji/1f602.svg" />',
      );
      expect(emojify('🙂')).toEqual(
        '<img draggable="false" class="emojione" alt="🙂" title=":slightly_smiling_face:" src="/packs/emoji/1f642.svg" />',
      );
      expect(emojify('🙃')).toEqual(
        '<img draggable="false" class="emojione" alt="🙃" title=":upside_down_face:" src="/packs/emoji/1f643.svg" />',
      );
      expect(emojify('🫠')).toEqual(
        '<img draggable="false" class="emojione" alt="🫠" title=":melting_face:" src="/packs/emoji/1fae0.svg" />',
      );
      expect(emojify('😉')).toEqual(
        '<img draggable="false" class="emojione" alt="😉" title=":wink:" src="/packs/emoji/1f609.svg" />',
      );
      expect(emojify('😊')).toEqual(
        '<img draggable="false" class="emojione" alt="😊" title=":blush:" src="/packs/emoji/1f60a.svg" />',
      );
      expect(emojify('😇')).toEqual(
        '<img draggable="false" class="emojione" alt="😇" title=":innocent:" src="/packs/emoji/1f607.svg" />',
      );
      expect(emojify('🥰')).toEqual(
        '<img draggable="false" class="emojione" alt="🥰" title=":smiling_face_with_3_hearts:" src="/packs/emoji/1f970.svg" />',
      );
      expect(emojify('😍')).toEqual(
        '<img draggable="false" class="emojione" alt="😍" title=":heart_eyes:" src="/packs/emoji/1f60d.svg" />',
      );
      expect(emojify('🤩')).toEqual(
        '<img draggable="false" class="emojione" alt="🤩" title=":star-struck:" src="/packs/emoji/1f929.svg" />',
      );
      expect(emojify('😘')).toEqual(
        '<img draggable="false" class="emojione" alt="😘" title=":kissing_heart:" src="/packs/emoji/1f618.svg" />',
      );
      expect(emojify('😗')).toEqual(
        '<img draggable="false" class="emojione" alt="😗" title=":kissing:" src="/packs/emoji/1f617.svg" />',
      );
      expect(emojify('☺️')).toEqual(
        '<img draggable="false" class="emojione" alt="☺️" title=":relaxed:" src="/packs/emoji/263a.svg" />',
      );
      expect(emojify('😚')).toEqual(
        '<img draggable="false" class="emojione" alt="😚" title=":kissing_closed_eyes:" src="/packs/emoji/1f61a.svg" />',
      );
      expect(emojify('😙')).toEqual(
        '<img draggable="false" class="emojione" alt="😙" title=":kissing_smiling_eyes:" src="/packs/emoji/1f619.svg" />',
      );
      expect(emojify('🥲')).toEqual(
        '<img draggable="false" class="emojione" alt="🥲" title=":smiling_face_with_tear:" src="/packs/emoji/1f972.svg" />',
      );
      expect(emojify('😋')).toEqual(
        '<img draggable="false" class="emojione" alt="😋" title=":yum:" src="/packs/emoji/1f60b.svg" />',
      );
      expect(emojify('😛')).toEqual(
        '<img draggable="false" class="emojione" alt="😛" title=":stuck_out_tongue:" src="/packs/emoji/1f61b.svg" />',
      );
      expect(emojify('😜')).toEqual(
        '<img draggable="false" class="emojione" alt="😜" title=":stuck_out_tongue_winking_eye:" src="/packs/emoji/1f61c.svg" />',
      );
      expect(emojify('🤪')).toEqual(
        '<img draggable="false" class="emojione" alt="🤪" title=":zany_face:" src="/packs/emoji/1f92a.svg" />',
      );
      expect(emojify('😝')).toEqual(
        '<img draggable="false" class="emojione" alt="😝" title=":stuck_out_tongue_closed_eyes:" src="/packs/emoji/1f61d.svg" />',
      );
      expect(emojify('🤑')).toEqual(
        '<img draggable="false" class="emojione" alt="🤑" title=":money_mouth_face:" src="/packs/emoji/1f911.svg" />',
      );
      expect(emojify('🤗')).toEqual(
        '<img draggable="false" class="emojione" alt="🤗" title=":hugging_face:" src="/packs/emoji/1f917.svg" />',
      );
      expect(emojify('🤭')).toEqual(
        '<img draggable="false" class="emojione" alt="🤭" title=":face_with_hand_over_mouth:" src="/packs/emoji/1f92d.svg" />',
      );
      expect(emojify('🫢')).toEqual(
        '<img draggable="false" class="emojione" alt="🫢" title=":face_with_open_eyes_and_hand_over_mouth:" src="/packs/emoji/1fae2.svg" />',
      );
      expect(emojify('🫣')).toEqual(
        '<img draggable="false" class="emojione" alt="🫣" title=":face_with_peeking_eye:" src="/packs/emoji/1fae3.svg" />',
      );
      expect(emojify('🤫')).toEqual(
        '<img draggable="false" class="emojione" alt="🤫" title=":shushing_face:" src="/packs/emoji/1f92b.svg" />',
      );
      expect(emojify('🤔')).toEqual(
        '<img draggable="false" class="emojione" alt="🤔" title=":thinking_face:" src="/packs/emoji/1f914.svg" />',
      );
      expect(emojify('🫡')).toEqual(
        '<img draggable="false" class="emojione" alt="🫡" title=":saluting_face:" src="/packs/emoji/1fae1.svg" />',
      );
      expect(emojify('🤐')).toEqual(
        '<img draggable="false" class="emojione" alt="🤐" title=":zipper_mouth_face:" src="/packs/emoji/1f910.svg" />',
      );
      expect(emojify('🤨')).toEqual(
        '<img draggable="false" class="emojione" alt="🤨" title=":face_with_raised_eyebrow:" src="/packs/emoji/1f928.svg" />',
      );
      expect(emojify('😐')).toEqual(
        '<img draggable="false" class="emojione" alt="😐" title=":neutral_face:" src="/packs/emoji/1f610.svg" />',
      );
      expect(emojify('😑')).toEqual(
        '<img draggable="false" class="emojione" alt="😑" title=":expressionless:" src="/packs/emoji/1f611.svg" />',
      );
      expect(emojify('😶')).toEqual(
        '<img draggable="false" class="emojione" alt="😶" title=":no_mouth:" src="/packs/emoji/1f636.svg" />',
      );
      expect(emojify('🫥')).toEqual(
        '<img draggable="false" class="emojione" alt="🫥" title=":dotted_line_face:" src="/packs/emoji/1fae5.svg" />',
      );
      expect(emojify('😶‍🌫️')).toEqual(
        '<img draggable="false" class="emojione" alt="😶‍🌫️" title=":face_in_clouds:" src="/packs/emoji/1f636-200d-1f32b-fe0f.svg" />',
      );
      expect(emojify('😏')).toEqual(
        '<img draggable="false" class="emojione" alt="😏" title=":smirk:" src="/packs/emoji/1f60f.svg" />',
      );
      expect(emojify('😒')).toEqual(
        '<img draggable="false" class="emojione" alt="😒" title=":unamused:" src="/packs/emoji/1f612.svg" />',
      );
      expect(emojify('🙄')).toEqual(
        '<img draggable="false" class="emojione" alt="🙄" title=":face_with_rolling_eyes:" src="/packs/emoji/1f644.svg" />',
      );
      expect(emojify('😬')).toEqual(
        '<img draggable="false" class="emojione" alt="😬" title=":grimacing:" src="/packs/emoji/1f62c.svg" />',
      );
      expect(emojify('😮‍💨')).toEqual(
        '<img draggable="false" class="emojione" alt="😮‍💨" title=":face_exhaling:" src="/packs/emoji/1f62e-200d-1f4a8.svg" />',
      );
      expect(emojify('🤥')).toEqual(
        '<img draggable="false" class="emojione" alt="🤥" title=":lying_face:" src="/packs/emoji/1f925.svg" />',
      );
      expect(emojify('😌')).toEqual(
        '<img draggable="false" class="emojione" alt="😌" title=":relieved:" src="/packs/emoji/1f60c.svg" />',
      );
      expect(emojify('😔')).toEqual(
        '<img draggable="false" class="emojione" alt="😔" title=":pensive:" src="/packs/emoji/1f614.svg" />',
      );
      expect(emojify('😪')).toEqual(
        '<img draggable="false" class="emojione" alt="😪" title=":sleepy:" src="/packs/emoji/1f62a.svg" />',
      );
      expect(emojify('🤤')).toEqual(
        '<img draggable="false" class="emojione" alt="🤤" title=":drooling_face:" src="/packs/emoji/1f924.svg" />',
      );
      expect(emojify('😴')).toEqual(
        '<img draggable="false" class="emojione" alt="😴" title=":sleeping:" src="/packs/emoji/1f634.svg" />',
      );
      expect(emojify('😷')).toEqual(
        '<img draggable="false" class="emojione" alt="😷" title=":mask:" src="/packs/emoji/1f637.svg" />',
      );
      expect(emojify('🤒')).toEqual(
        '<img draggable="false" class="emojione" alt="🤒" title=":face_with_thermometer:" src="/packs/emoji/1f912.svg" />',
      );
      expect(emojify('🤕')).toEqual(
        '<img draggable="false" class="emojione" alt="🤕" title=":face_with_head_bandage:" src="/packs/emoji/1f915.svg" />',
      );
      expect(emojify('🤢')).toEqual(
        '<img draggable="false" class="emojione" alt="🤢" title=":nauseated_face:" src="/packs/emoji/1f922.svg" />',
      );
      expect(emojify('🤮')).toEqual(
        '<img draggable="false" class="emojione" alt="🤮" title=":face_vomiting:" src="/packs/emoji/1f92e.svg" />',
      );
      expect(emojify('🤧')).toEqual(
        '<img draggable="false" class="emojione" alt="🤧" title=":sneezing_face:" src="/packs/emoji/1f927.svg" />',
      );
      expect(emojify('🥵')).toEqual(
        '<img draggable="false" class="emojione" alt="🥵" title=":hot_face:" src="/packs/emoji/1f975.svg" />',
      );
      expect(emojify('🥶')).toEqual(
        '<img draggable="false" class="emojione" alt="🥶" title=":cold_face:" src="/packs/emoji/1f976.svg" />',
      );
      expect(emojify('🥴')).toEqual(
        '<img draggable="false" class="emojione" alt="🥴" title=":woozy_face:" src="/packs/emoji/1f974.svg" />',
      );
      expect(emojify('😵')).toEqual(
        '<img draggable="false" class="emojione" alt="😵" title=":dizzy_face:" src="/packs/emoji/1f635.svg" />',
      );
      expect(emojify('😵‍💫')).toEqual(
        '<img draggable="false" class="emojione" alt="😵‍💫" title=":face_with_spiral_eyes:" src="/packs/emoji/1f635-200d-1f4ab.svg" />',
      );
      expect(emojify('🤯')).toEqual(
        '<img draggable="false" class="emojione" alt="🤯" title=":exploding_head:" src="/packs/emoji/1f92f.svg" />',
      );
      expect(emojify('🤠')).toEqual(
        '<img draggable="false" class="emojione" alt="🤠" title=":face_with_cowboy_hat:" src="/packs/emoji/1f920.svg" />',
      );
      expect(emojify('🥳')).toEqual(
        '<img draggable="false" class="emojione" alt="🥳" title=":partying_face:" src="/packs/emoji/1f973.svg" />',
      );
      expect(emojify('🥸')).toEqual(
        '<img draggable="false" class="emojione" alt="🥸" title=":disguised_face:" src="/packs/emoji/1f978.svg" />',
      );
      expect(emojify('😎')).toEqual(
        '<img draggable="false" class="emojione" alt="😎" title=":sunglasses:" src="/packs/emoji/1f60e.svg" />',
      );
      expect(emojify('🤓')).toEqual(
        '<img draggable="false" class="emojione" alt="🤓" title=":nerd_face:" src="/packs/emoji/1f913.svg" />',
      );
      expect(emojify('🧐')).toEqual(
        '<img draggable="false" class="emojione" alt="🧐" title=":face_with_monocle:" src="/packs/emoji/1f9d0.svg" />',
      );
      expect(emojify('😕')).toEqual(
        '<img draggable="false" class="emojione" alt="😕" title=":confused:" src="/packs/emoji/1f615.svg" />',
      );
      expect(emojify('🫤')).toEqual(
        '<img draggable="false" class="emojione" alt="🫤" title=":face_with_diagonal_mouth:" src="/packs/emoji/1fae4.svg" />',
      );
      expect(emojify('😟')).toEqual(
        '<img draggable="false" class="emojione" alt="😟" title=":worried:" src="/packs/emoji/1f61f.svg" />',
      );
      expect(emojify('🙁')).toEqual(
        '<img draggable="false" class="emojione" alt="🙁" title=":slightly_frowning_face:" src="/packs/emoji/1f641.svg" />',
      );
      expect(emojify('☹️')).toEqual(
        '<img draggable="false" class="emojione" alt="☹️" title=":white_frowning_face:" src="/packs/emoji/2639.svg" />',
      );
      expect(emojify('😮')).toEqual(
        '<img draggable="false" class="emojione" alt="😮" title=":open_mouth:" src="/packs/emoji/1f62e.svg" />',
      );
      expect(emojify('😯')).toEqual(
        '<img draggable="false" class="emojione" alt="😯" title=":hushed:" src="/packs/emoji/1f62f.svg" />',
      );
      expect(emojify('😲')).toEqual(
        '<img draggable="false" class="emojione" alt="😲" title=":astonished:" src="/packs/emoji/1f632.svg" />',
      );
      expect(emojify('😳')).toEqual(
        '<img draggable="false" class="emojione" alt="😳" title=":flushed:" src="/packs/emoji/1f633.svg" />',
      );
      expect(emojify('🥺')).toEqual(
        '<img draggable="false" class="emojione" alt="🥺" title=":pleading_face:" src="/packs/emoji/1f97a.svg" />',
      );
      expect(emojify('🥹')).toEqual(
        '<img draggable="false" class="emojione" alt="🥹" title=":face_holding_back_tears:" src="/packs/emoji/1f979.svg" />',
      );
      expect(emojify('😦')).toEqual(
        '<img draggable="false" class="emojione" alt="😦" title=":frowning:" src="/packs/emoji/1f626.svg" />',
      );
      expect(emojify('😧')).toEqual(
        '<img draggable="false" class="emojione" alt="😧" title=":anguished:" src="/packs/emoji/1f627.svg" />',
      );
      expect(emojify('😨')).toEqual(
        '<img draggable="false" class="emojione" alt="😨" title=":fearful:" src="/packs/emoji/1f628.svg" />',
      );
      expect(emojify('😰')).toEqual(
        '<img draggable="false" class="emojione" alt="😰" title=":cold_sweat:" src="/packs/emoji/1f630.svg" />',
      );
      expect(emojify('😥')).toEqual(
        '<img draggable="false" class="emojione" alt="😥" title=":disappointed_relieved:" src="/packs/emoji/1f625.svg" />',
      );
      expect(emojify('😢')).toEqual(
        '<img draggable="false" class="emojione" alt="😢" title=":cry:" src="/packs/emoji/1f622.svg" />',
      );
      expect(emojify('😭')).toEqual(
        '<img draggable="false" class="emojione" alt="😭" title=":sob:" src="/packs/emoji/1f62d.svg" />',
      );
      expect(emojify('😱')).toEqual(
        '<img draggable="false" class="emojione" alt="😱" title=":scream:" src="/packs/emoji/1f631.svg" />',
      );
      expect(emojify('😖')).toEqual(
        '<img draggable="false" class="emojione" alt="😖" title=":confounded:" src="/packs/emoji/1f616.svg" />',
      );
      expect(emojify('😣')).toEqual(
        '<img draggable="false" class="emojione" alt="😣" title=":persevere:" src="/packs/emoji/1f623.svg" />',
      );
      expect(emojify('😞')).toEqual(
        '<img draggable="false" class="emojione" alt="😞" title=":disappointed:" src="/packs/emoji/1f61e.svg" />',
      );
      expect(emojify('😓')).toEqual(
        '<img draggable="false" class="emojione" alt="😓" title=":sweat:" src="/packs/emoji/1f613.svg" />',
      );
      expect(emojify('😩')).toEqual(
        '<img draggable="false" class="emojione" alt="😩" title=":weary:" src="/packs/emoji/1f629.svg" />',
      );
      expect(emojify('😫')).toEqual(
        '<img draggable="false" class="emojione" alt="😫" title=":tired_face:" src="/packs/emoji/1f62b.svg" />',
      );
      expect(emojify('🥱')).toEqual(
        '<img draggable="false" class="emojione" alt="🥱" title=":yawning_face:" src="/packs/emoji/1f971.svg" />',
      );
      expect(emojify('😤')).toEqual(
        '<img draggable="false" class="emojione" alt="😤" title=":triumph:" src="/packs/emoji/1f624.svg" />',
      );
      expect(emojify('😡')).toEqual(
        '<img draggable="false" class="emojione" alt="😡" title=":rage:" src="/packs/emoji/1f621.svg" />',
      );
      expect(emojify('😠')).toEqual(
        '<img draggable="false" class="emojione" alt="😠" title=":angry:" src="/packs/emoji/1f620.svg" />',
      );
      expect(emojify('🤬')).toEqual(
        '<img draggable="false" class="emojione" alt="🤬" title=":face_with_symbols_on_mouth:" src="/packs/emoji/1f92c.svg" />',
      );
      expect(emojify('😈')).toEqual(
        '<img draggable="false" class="emojione" alt="😈" title=":smiling_imp:" src="/packs/emoji/1f608.svg" />',
      );
      expect(emojify('👿')).toEqual(
        '<img draggable="false" class="emojione" alt="👿" title=":imp:" src="/packs/emoji/1f47f.svg" />',
      );
      expect(emojify('💀')).toEqual(
        '<img draggable="false" class="emojione" alt="💀" title=":skull:" src="/packs/emoji/1f480.svg" />',
      );
      expect(emojify('☠️')).toEqual(
        '<img draggable="false" class="emojione" alt="☠️" title=":skull_and_crossbones:" src="/packs/emoji/2620.svg" />',
      );
      expect(emojify('💩')).toEqual(
        '<img draggable="false" class="emojione" alt="💩" title=":hankey:" src="/packs/emoji/1f4a9.svg" />',
      );
      expect(emojify('🤡')).toEqual(
        '<img draggable="false" class="emojione" alt="🤡" title=":clown_face:" src="/packs/emoji/1f921.svg" />',
      );
      expect(emojify('👹')).toEqual(
        '<img draggable="false" class="emojione" alt="👹" title=":japanese_ogre:" src="/packs/emoji/1f479.svg" />',
      );
      expect(emojify('👺')).toEqual(
        '<img draggable="false" class="emojione" alt="👺" title=":japanese_goblin:" src="/packs/emoji/1f47a.svg" />',
      );
      expect(emojify('👻')).toEqual(
        '<img draggable="false" class="emojione" alt="👻" title=":ghost:" src="/packs/emoji/1f47b.svg" />',
      );
      expect(emojify('👽')).toEqual(
        '<img draggable="false" class="emojione" alt="👽" title=":alien:" src="/packs/emoji/1f47d.svg" />',
      );
      expect(emojify('👾')).toEqual(
        '<img draggable="false" class="emojione" alt="👾" title=":space_invader:" src="/packs/emoji/1f47e.svg" />',
      );
      expect(emojify('🤖')).toEqual(
        '<img draggable="false" class="emojione" alt="🤖" title=":robot_face:" src="/packs/emoji/1f916.svg" />',
      );
      expect(emojify('😺')).toEqual(
        '<img draggable="false" class="emojione" alt="😺" title=":smiley_cat:" src="/packs/emoji/1f63a.svg" />',
      );
      expect(emojify('😸')).toEqual(
        '<img draggable="false" class="emojione" alt="😸" title=":smile_cat:" src="/packs/emoji/1f638.svg" />',
      );
      expect(emojify('😹')).toEqual(
        '<img draggable="false" class="emojione" alt="😹" title=":joy_cat:" src="/packs/emoji/1f639.svg" />',
      );
      expect(emojify('😻')).toEqual(
        '<img draggable="false" class="emojione" alt="😻" title=":heart_eyes_cat:" src="/packs/emoji/1f63b.svg" />',
      );
      expect(emojify('😼')).toEqual(
        '<img draggable="false" class="emojione" alt="😼" title=":smirk_cat:" src="/packs/emoji/1f63c.svg" />',
      );
      expect(emojify('😽')).toEqual(
        '<img draggable="false" class="emojione" alt="😽" title=":kissing_cat:" src="/packs/emoji/1f63d.svg" />',
      );
      expect(emojify('🙀')).toEqual(
        '<img draggable="false" class="emojione" alt="🙀" title=":scream_cat:" src="/packs/emoji/1f640.svg" />',
      );
      expect(emojify('😿')).toEqual(
        '<img draggable="false" class="emojione" alt="😿" title=":crying_cat_face:" src="/packs/emoji/1f63f.svg" />',
      );
      expect(emojify('😾')).toEqual(
        '<img draggable="false" class="emojione" alt="😾" title=":pouting_cat:" src="/packs/emoji/1f63e.svg" />',
      );
      expect(emojify('🙈')).toEqual(
        '<img draggable="false" class="emojione" alt="🙈" title=":see_no_evil:" src="/packs/emoji/1f648.svg" />',
      );
      expect(emojify('🙉')).toEqual(
        '<img draggable="false" class="emojione" alt="🙉" title=":hear_no_evil:" src="/packs/emoji/1f649.svg" />',
      );
      expect(emojify('🙊')).toEqual(
        '<img draggable="false" class="emojione" alt="🙊" title=":speak_no_evil:" src="/packs/emoji/1f64a.svg" />',
      );
      expect(emojify('💋')).toEqual(
        '<img draggable="false" class="emojione" alt="💋" title=":kiss:" src="/packs/emoji/1f48b.svg" />',
      );
      expect(emojify('💌')).toEqual(
        '<img draggable="false" class="emojione" alt="💌" title=":love_letter:" src="/packs/emoji/1f48c.svg" />',
      );
      expect(emojify('💘')).toEqual(
        '<img draggable="false" class="emojione" alt="💘" title=":cupid:" src="/packs/emoji/1f498.svg" />',
      );
      expect(emojify('💝')).toEqual(
        '<img draggable="false" class="emojione" alt="💝" title=":gift_heart:" src="/packs/emoji/1f49d.svg" />',
      );
      expect(emojify('💖')).toEqual(
        '<img draggable="false" class="emojione" alt="💖" title=":sparkling_heart:" src="/packs/emoji/1f496.svg" />',
      );
      expect(emojify('💗')).toEqual(
        '<img draggable="false" class="emojione" alt="💗" title=":heartpulse:" src="/packs/emoji/1f497.svg" />',
      );
      expect(emojify('💓')).toEqual(
        '<img draggable="false" class="emojione" alt="💓" title=":heartbeat:" src="/packs/emoji/1f493.svg" />',
      );
      expect(emojify('💞')).toEqual(
        '<img draggable="false" class="emojione" alt="💞" title=":revolving_hearts:" src="/packs/emoji/1f49e.svg" />',
      );
      expect(emojify('💕')).toEqual(
        '<img draggable="false" class="emojione" alt="💕" title=":two_hearts:" src="/packs/emoji/1f495.svg" />',
      );
      expect(emojify('💟')).toEqual(
        '<img draggable="false" class="emojione" alt="💟" title=":heart_decoration:" src="/packs/emoji/1f49f.svg" />',
      );
      expect(emojify('❣️')).toEqual(
        '<img draggable="false" class="emojione" alt="❣️" title=":heavy_heart_exclamation_mark_ornament:" src="/packs/emoji/2763.svg" />',
      );
      expect(emojify('💔')).toEqual(
        '<img draggable="false" class="emojione" alt="💔" title=":broken_heart:" src="/packs/emoji/1f494.svg" />',
      );
      expect(emojify('❤️‍🔥')).toEqual(
        '<img draggable="false" class="emojione" alt="❤️‍🔥" title=":heart_on_fire:" src="/packs/emoji/2764-fe0f-200d-1f525.svg" />',
      );
      expect(emojify('❤️‍🩹')).toEqual(
        '<img draggable="false" class="emojione" alt="❤️‍🩹" title=":mending_heart:" src="/packs/emoji/2764-fe0f-200d-1fa79.svg" />',
      );
      expect(emojify('❤️')).toEqual(
        '<img draggable="false" class="emojione" alt="❤️" title=":heart:" src="/packs/emoji/2764.svg" />',
      );
      expect(emojify('🧡')).toEqual(
        '<img draggable="false" class="emojione" alt="🧡" title=":orange_heart:" src="/packs/emoji/1f9e1.svg" />',
      );
      expect(emojify('💛')).toEqual(
        '<img draggable="false" class="emojione" alt="💛" title=":yellow_heart:" src="/packs/emoji/1f49b.svg" />',
      );
      expect(emojify('💚')).toEqual(
        '<img draggable="false" class="emojione" alt="💚" title=":green_heart:" src="/packs/emoji/1f49a.svg" />',
      );
      expect(emojify('💙')).toEqual(
        '<img draggable="false" class="emojione" alt="💙" title=":blue_heart:" src="/packs/emoji/1f499.svg" />',
      );
      expect(emojify('💜')).toEqual(
        '<img draggable="false" class="emojione" alt="💜" title=":purple_heart:" src="/packs/emoji/1f49c.svg" />',
      );
      expect(emojify('🤎')).toEqual(
        '<img draggable="false" class="emojione" alt="🤎" title=":brown_heart:" src="/packs/emoji/1f90e.svg" />',
      );
      expect(emojify('🖤')).toEqual(
        '<img draggable="false" class="emojione" alt="🖤" title=":black_heart:" src="/packs/emoji/1f5a4.svg" />',
      );
      expect(emojify('🤍')).toEqual(
        '<img draggable="false" class="emojione" alt="🤍" title=":white_heart:" src="/packs/emoji/1f90d.svg" />',
      );
      expect(emojify('💢')).toEqual(
        '<img draggable="false" class="emojione" alt="💢" title=":anger:" src="/packs/emoji/1f4a2.svg" />',
      );
      expect(emojify('💥')).toEqual(
        '<img draggable="false" class="emojione" alt="💥" title=":boom:" src="/packs/emoji/1f4a5.svg" />',
      );
      expect(emojify('💫')).toEqual(
        '<img draggable="false" class="emojione" alt="💫" title=":dizzy:" src="/packs/emoji/1f4ab.svg" />',
      );
      expect(emojify('💦')).toEqual(
        '<img draggable="false" class="emojione" alt="💦" title=":sweat_drops:" src="/packs/emoji/1f4a6.svg" />',
      );
      expect(emojify('💨')).toEqual(
        '<img draggable="false" class="emojione" alt="💨" title=":dash:" src="/packs/emoji/1f4a8.svg" />',
      );
      expect(emojify('🕳️')).toEqual(
        '<img draggable="false" class="emojione" alt="🕳️" title=":hole:" src="/packs/emoji/1f573.svg" />',
      );
      expect(emojify('💣')).toEqual(
        '<img draggable="false" class="emojione" alt="💣" title=":bomb:" src="/packs/emoji/1f4a3.svg" />',
      );
      expect(emojify('💬')).toEqual(
        '<img draggable="false" class="emojione" alt="💬" title=":speech_balloon:" src="/packs/emoji/1f4ac.svg" />',
      );
      expect(emojify('👁️‍🗨️')).toEqual(
        '<img draggable="false" class="emojione" alt="👁️‍🗨️" title=":eye-in-speech-bubble:" src="/packs/emoji/1f441-200d-1f5e8.svg" />',
      );
      expect(emojify('🗨️')).toEqual(
        '<img draggable="false" class="emojione" alt="🗨️" title=":left_speech_bubble:" src="/packs/emoji/1f5e8.svg" />',
      );
      expect(emojify('🗯️')).toEqual(
        '<img draggable="false" class="emojione" alt="🗯️" title=":right_anger_bubble:" src="/packs/emoji/1f5ef.svg" />',
      );
      expect(emojify('💭')).toEqual(
        '<img draggable="false" class="emojione" alt="💭" title=":thought_balloon:" src="/packs/emoji/1f4ad.svg" />',
      );
      expect(emojify('💤')).toEqual(
        '<img draggable="false" class="emojione" alt="💤" title=":zzz:" src="/packs/emoji/1f4a4.svg" />',
      );
      expect(emojify('👋')).toEqual(
        '<img draggable="false" class="emojione" alt="👋" title=":wave:" src="/packs/emoji/1f44b.svg" />',
      );
      expect(emojify('🤚')).toEqual(
        '<img draggable="false" class="emojione" alt="🤚" title=":raised_back_of_hand:" src="/packs/emoji/1f91a.svg" />',
      );
      expect(emojify('🖐️')).toEqual(
        '<img draggable="false" class="emojione" alt="🖐️" title=":raised_hand_with_fingers_splayed:" src="/packs/emoji/1f590.svg" />',
      );
      expect(emojify('✋')).toEqual(
        '<img draggable="false" class="emojione" alt="✋" title=":hand:" src="/packs/emoji/270b.svg" />',
      );
      expect(emojify('🖖')).toEqual(
        '<img draggable="false" class="emojione" alt="🖖" title=":spock-hand:" src="/packs/emoji/1f596.svg" />',
      );
      expect(emojify('🫱')).toEqual(
        '<img draggable="false" class="emojione" alt="🫱" title=":rightwards_hand:" src="/packs/emoji/1faf1.svg" />',
      );
      expect(emojify('🫲')).toEqual(
        '<img draggable="false" class="emojione" alt="🫲" title=":leftwards_hand:" src="/packs/emoji/1faf2.svg" />',
      );
      expect(emojify('🫳')).toEqual(
        '<img draggable="false" class="emojione" alt="🫳" title=":palm_down_hand:" src="/packs/emoji/1faf3.svg" />',
      );
      expect(emojify('🫴')).toEqual(
        '<img draggable="false" class="emojione" alt="🫴" title=":palm_up_hand:" src="/packs/emoji/1faf4.svg" />',
      );
      expect(emojify('👌')).toEqual(
        '<img draggable="false" class="emojione" alt="👌" title=":ok_hand:" src="/packs/emoji/1f44c.svg" />',
      );
      expect(emojify('🤌')).toEqual(
        '<img draggable="false" class="emojione" alt="🤌" title=":pinched_fingers:" src="/packs/emoji/1f90c.svg" />',
      );
      expect(emojify('🤏')).toEqual(
        '<img draggable="false" class="emojione" alt="🤏" title=":pinching_hand:" src="/packs/emoji/1f90f.svg" />',
      );
      expect(emojify('✌️')).toEqual(
        '<img draggable="false" class="emojione" alt="✌️" title=":v:" src="/packs/emoji/270c.svg" />',
      );
      expect(emojify('🤞')).toEqual(
        '<img draggable="false" class="emojione" alt="🤞" title=":crossed_fingers:" src="/packs/emoji/1f91e.svg" />',
      );
      expect(emojify('🫰')).toEqual(
        '<img draggable="false" class="emojione" alt="🫰" title=":hand_with_index_finger_and_thumb_crossed:" src="/packs/emoji/1faf0.svg" />',
      );
      expect(emojify('🤟')).toEqual(
        '<img draggable="false" class="emojione" alt="🤟" title=":i_love_you_hand_sign:" src="/packs/emoji/1f91f.svg" />',
      );
      expect(emojify('🤘')).toEqual(
        '<img draggable="false" class="emojione" alt="🤘" title=":the_horns:" src="/packs/emoji/1f918.svg" />',
      );
      expect(emojify('🤙')).toEqual(
        '<img draggable="false" class="emojione" alt="🤙" title=":call_me_hand:" src="/packs/emoji/1f919.svg" />',
      );
      expect(emojify('👈')).toEqual(
        '<img draggable="false" class="emojione" alt="👈" title=":point_left:" src="/packs/emoji/1f448.svg" />',
      );
      expect(emojify('👉')).toEqual(
        '<img draggable="false" class="emojione" alt="👉" title=":point_right:" src="/packs/emoji/1f449.svg" />',
      );
      expect(emojify('👆')).toEqual(
        '<img draggable="false" class="emojione" alt="👆" title=":point_up_2:" src="/packs/emoji/1f446.svg" />',
      );
      expect(emojify('🖕')).toEqual(
        '<img draggable="false" class="emojione" alt="🖕" title=":middle_finger:" src="/packs/emoji/1f595.svg" />',
      );
      expect(emojify('👇')).toEqual(
        '<img draggable="false" class="emojione" alt="👇" title=":point_down:" src="/packs/emoji/1f447.svg" />',
      );
      expect(emojify('☝️')).toEqual(
        '<img draggable="false" class="emojione" alt="☝️" title=":point_up:" src="/packs/emoji/261d.svg" />',
      );
      expect(emojify('🫵')).toEqual(
        '<img draggable="false" class="emojione" alt="🫵" title=":index_pointing_at_the_viewer:" src="/packs/emoji/1faf5.svg" />',
      );
      expect(emojify('👍')).toEqual(
        '<img draggable="false" class="emojione" alt="👍" title=":+1:" src="/packs/emoji/1f44d.svg" />',
      );
      expect(emojify('👎')).toEqual(
        '<img draggable="false" class="emojione" alt="👎" title=":-1:" src="/packs/emoji/1f44e.svg" />',
      );
      expect(emojify('✊')).toEqual(
        '<img draggable="false" class="emojione" alt="✊" title=":fist:" src="/packs/emoji/270a.svg" />',
      );
      expect(emojify('👊')).toEqual(
        '<img draggable="false" class="emojione" alt="👊" title=":facepunch:" src="/packs/emoji/1f44a.svg" />',
      );
      expect(emojify('🤛')).toEqual(
        '<img draggable="false" class="emojione" alt="🤛" title=":left-facing_fist:" src="/packs/emoji/1f91b.svg" />',
      );
      expect(emojify('🤜')).toEqual(
        '<img draggable="false" class="emojione" alt="🤜" title=":right-facing_fist:" src="/packs/emoji/1f91c.svg" />',
      );
      expect(emojify('👏')).toEqual(
        '<img draggable="false" class="emojione" alt="👏" title=":clap:" src="/packs/emoji/1f44f.svg" />',
      );
      expect(emojify('🙌')).toEqual(
        '<img draggable="false" class="emojione" alt="🙌" title=":raised_hands:" src="/packs/emoji/1f64c.svg" />',
      );
      expect(emojify('🫶')).toEqual(
        '<img draggable="false" class="emojione" alt="🫶" title=":heart_hands:" src="/packs/emoji/1faf6.svg" />',
      );
      expect(emojify('👐')).toEqual(
        '<img draggable="false" class="emojione" alt="👐" title=":open_hands:" src="/packs/emoji/1f450.svg" />',
      );
      expect(emojify('🤲')).toEqual(
        '<img draggable="false" class="emojione" alt="🤲" title=":palms_up_together:" src="/packs/emoji/1f932.svg" />',
      );
      expect(emojify('🤝')).toEqual(
        '<img draggable="false" class="emojione" alt="🤝" title=":handshake:" src="/packs/emoji/1f91d.svg" />',
      );
      expect(emojify('🙏')).toEqual(
        '<img draggable="false" class="emojione" alt="🙏" title=":pray:" src="/packs/emoji/1f64f.svg" />',
      );
      expect(emojify('✍️')).toEqual(
        '<img draggable="false" class="emojione" alt="✍️" title=":writing_hand:" src="/packs/emoji/270d.svg" />',
      );
      expect(emojify('💅')).toEqual(
        '<img draggable="false" class="emojione" alt="💅" title=":nail_care:" src="/packs/emoji/1f485.svg" />',
      );
      expect(emojify('🤳')).toEqual(
        '<img draggable="false" class="emojione" alt="🤳" title=":selfie:" src="/packs/emoji/1f933.svg" />',
      );
      expect(emojify('💪')).toEqual(
        '<img draggable="false" class="emojione" alt="💪" title=":muscle:" src="/packs/emoji/1f4aa.svg" />',
      );
      expect(emojify('🦾')).toEqual(
        '<img draggable="false" class="emojione" alt="🦾" title=":mechanical_arm:" src="/packs/emoji/1f9be.svg" />',
      );
      expect(emojify('🦿')).toEqual(
        '<img draggable="false" class="emojione" alt="🦿" title=":mechanical_leg:" src="/packs/emoji/1f9bf.svg" />',
      );
      expect(emojify('🦵')).toEqual(
        '<img draggable="false" class="emojione" alt="🦵" title=":leg:" src="/packs/emoji/1f9b5.svg" />',
      );
      expect(emojify('🦶')).toEqual(
        '<img draggable="false" class="emojione" alt="🦶" title=":foot:" src="/packs/emoji/1f9b6.svg" />',
      );
      expect(emojify('👂')).toEqual(
        '<img draggable="false" class="emojione" alt="👂" title=":ear:" src="/packs/emoji/1f442.svg" />',
      );
      expect(emojify('🦻')).toEqual(
        '<img draggable="false" class="emojione" alt="🦻" title=":ear_with_hearing_aid:" src="/packs/emoji/1f9bb.svg" />',
      );
      expect(emojify('👃')).toEqual(
        '<img draggable="false" class="emojione" alt="👃" title=":nose:" src="/packs/emoji/1f443.svg" />',
      );
      expect(emojify('🧠')).toEqual(
        '<img draggable="false" class="emojione" alt="🧠" title=":brain:" src="/packs/emoji/1f9e0.svg" />',
      );
      expect(emojify('🫀')).toEqual(
        '<img draggable="false" class="emojione" alt="🫀" title=":anatomical_heart:" src="/packs/emoji/1fac0.svg" />',
      );
      expect(emojify('🫁')).toEqual(
        '<img draggable="false" class="emojione" alt="🫁" title=":lungs:" src="/packs/emoji/1fac1.svg" />',
      );
      expect(emojify('🦷')).toEqual(
        '<img draggable="false" class="emojione" alt="🦷" title=":tooth:" src="/packs/emoji/1f9b7.svg" />',
      );
      expect(emojify('🦴')).toEqual(
        '<img draggable="false" class="emojione" alt="🦴" title=":bone:" src="/packs/emoji/1f9b4.svg" />',
      );
      expect(emojify('👀')).toEqual(
        '<img draggable="false" class="emojione" alt="👀" title=":eyes:" src="/packs/emoji/1f440.svg" />',
      );
      expect(emojify('👁️')).toEqual(
        '<img draggable="false" class="emojione" alt="👁️" title=":eye:" src="/packs/emoji/1f441.svg" />',
      );
      expect(emojify('👅')).toEqual(
        '<img draggable="false" class="emojione" alt="👅" title=":tongue:" src="/packs/emoji/1f445.svg" />',
      );
      expect(emojify('👄')).toEqual(
        '<img draggable="false" class="emojione" alt="👄" title=":lips:" src="/packs/emoji/1f444.svg" />',
      );
      expect(emojify('🫦')).toEqual(
        '<img draggable="false" class="emojione" alt="🫦" title=":biting_lip:" src="/packs/emoji/1fae6.svg" />',
      );
      expect(emojify('👶')).toEqual(
        '<img draggable="false" class="emojione" alt="👶" title=":baby:" src="/packs/emoji/1f476.svg" />',
      );
      expect(emojify('🧒')).toEqual(
        '<img draggable="false" class="emojione" alt="🧒" title=":child:" src="/packs/emoji/1f9d2.svg" />',
      );
      expect(emojify('👦')).toEqual(
        '<img draggable="false" class="emojione" alt="👦" title=":boy:" src="/packs/emoji/1f466.svg" />',
      );
      expect(emojify('👧')).toEqual(
        '<img draggable="false" class="emojione" alt="👧" title=":girl:" src="/packs/emoji/1f467.svg" />',
      );
      expect(emojify('🧑')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑" title=":adult:" src="/packs/emoji/1f9d1.svg" />',
      );
      expect(emojify('👱')).toEqual(
        '<img draggable="false" class="emojione" alt="👱" title=":person_with_blond_hair:" src="/packs/emoji/1f471.svg" />',
      );
      expect(emojify('👨')).toEqual(
        '<img draggable="false" class="emojione" alt="👨" title=":man:" src="/packs/emoji/1f468.svg" />',
      );
      expect(emojify('🧔')).toEqual(
        '<img draggable="false" class="emojione" alt="🧔" title=":bearded_person:" src="/packs/emoji/1f9d4.svg" />',
      );
      expect(emojify('🧔‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧔‍♂️" title=":man_with_beard:" src="/packs/emoji/1f9d4-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🧔‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧔‍♀️" title=":woman_with_beard:" src="/packs/emoji/1f9d4-200d-2640-fe0f.svg" />',
      );
      expect(emojify('👨‍🦰')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🦰" title=":red_haired_man:" src="/packs/emoji/1f468-200d-1f9b0.svg" />',
      );
      expect(emojify('👨‍🦱')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🦱" title=":curly_haired_man:" src="/packs/emoji/1f468-200d-1f9b1.svg" />',
      );
      expect(emojify('👨‍🦳')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🦳" title=":white_haired_man:" src="/packs/emoji/1f468-200d-1f9b3.svg" />',
      );
      expect(emojify('👨‍🦲')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🦲" title=":bald_man:" src="/packs/emoji/1f468-200d-1f9b2.svg" />',
      );
      expect(emojify('👩')).toEqual(
        '<img draggable="false" class="emojione" alt="👩" title=":woman:" src="/packs/emoji/1f469.svg" />',
      );
      expect(emojify('👩‍🦰')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🦰" title=":red_haired_woman:" src="/packs/emoji/1f469-200d-1f9b0.svg" />',
      );
      expect(emojify('🧑‍🦰')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🦰" title=":red_haired_person:" src="/packs/emoji/1f9d1-200d-1f9b0.svg" />',
      );
      expect(emojify('👩‍🦱')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🦱" title=":curly_haired_woman:" src="/packs/emoji/1f469-200d-1f9b1.svg" />',
      );
      expect(emojify('🧑‍🦱')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🦱" title=":curly_haired_person:" src="/packs/emoji/1f9d1-200d-1f9b1.svg" />',
      );
      expect(emojify('👩‍🦳')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🦳" title=":white_haired_woman:" src="/packs/emoji/1f469-200d-1f9b3.svg" />',
      );
      expect(emojify('🧑‍🦳')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🦳" title=":white_haired_person:" src="/packs/emoji/1f9d1-200d-1f9b3.svg" />',
      );
      expect(emojify('👩‍🦲')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🦲" title=":bald_woman:" src="/packs/emoji/1f469-200d-1f9b2.svg" />',
      );
      expect(emojify('🧑‍🦲')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🦲" title=":bald_person:" src="/packs/emoji/1f9d1-200d-1f9b2.svg" />',
      );
      expect(emojify('👱‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="👱‍♀️" title=":blond-haired-woman:" src="/packs/emoji/1f471-200d-2640-fe0f.svg" />',
      );
      expect(emojify('👱‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="👱‍♂️" title=":blond-haired-man:" src="/packs/emoji/1f471-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🧓')).toEqual(
        '<img draggable="false" class="emojione" alt="🧓" title=":older_adult:" src="/packs/emoji/1f9d3.svg" />',
      );
      expect(emojify('👴')).toEqual(
        '<img draggable="false" class="emojione" alt="👴" title=":older_man:" src="/packs/emoji/1f474.svg" />',
      );
      expect(emojify('👵')).toEqual(
        '<img draggable="false" class="emojione" alt="👵" title=":older_woman:" src="/packs/emoji/1f475.svg" />',
      );
      expect(emojify('🙍')).toEqual(
        '<img draggable="false" class="emojione" alt="🙍" title=":person_frowning:" src="/packs/emoji/1f64d.svg" />',
      );
      expect(emojify('🙍‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🙍‍♂️" title=":man-frowning:" src="/packs/emoji/1f64d-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🙍‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🙍‍♀️" title=":woman-frowning:" src="/packs/emoji/1f64d-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🙎')).toEqual(
        '<img draggable="false" class="emojione" alt="🙎" title=":person_with_pouting_face:" src="/packs/emoji/1f64e.svg" />',
      );
      expect(emojify('🙎‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🙎‍♂️" title=":man-pouting:" src="/packs/emoji/1f64e-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🙎‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🙎‍♀️" title=":woman-pouting:" src="/packs/emoji/1f64e-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🙅')).toEqual(
        '<img draggable="false" class="emojione" alt="🙅" title=":no_good:" src="/packs/emoji/1f645.svg" />',
      );
      expect(emojify('🙅‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🙅‍♂️" title=":man-gesturing-no:" src="/packs/emoji/1f645-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🙅‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🙅‍♀️" title=":woman-gesturing-no:" src="/packs/emoji/1f645-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🙆')).toEqual(
        '<img draggable="false" class="emojione" alt="🙆" title=":ok_woman:" src="/packs/emoji/1f646.svg" />',
      );
      expect(emojify('🙆‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🙆‍♂️" title=":man-gesturing-ok:" src="/packs/emoji/1f646-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🙆‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🙆‍♀️" title=":woman-gesturing-ok:" src="/packs/emoji/1f646-200d-2640-fe0f.svg" />',
      );
      expect(emojify('💁')).toEqual(
        '<img draggable="false" class="emojione" alt="💁" title=":information_desk_person:" src="/packs/emoji/1f481.svg" />',
      );
      expect(emojify('💁‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="💁‍♂️" title=":man-tipping-hand:" src="/packs/emoji/1f481-200d-2642-fe0f.svg" />',
      );
      expect(emojify('💁‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="💁‍♀️" title=":woman-tipping-hand:" src="/packs/emoji/1f481-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🙋')).toEqual(
        '<img draggable="false" class="emojione" alt="🙋" title=":raising_hand:" src="/packs/emoji/1f64b.svg" />',
      );
      expect(emojify('🙋‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🙋‍♂️" title=":man-raising-hand:" src="/packs/emoji/1f64b-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🙋‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🙋‍♀️" title=":woman-raising-hand:" src="/packs/emoji/1f64b-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🧏')).toEqual(
        '<img draggable="false" class="emojione" alt="🧏" title=":deaf_person:" src="/packs/emoji/1f9cf.svg" />',
      );
      expect(emojify('🧏‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧏‍♂️" title=":deaf_man:" src="/packs/emoji/1f9cf-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🧏‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧏‍♀️" title=":deaf_woman:" src="/packs/emoji/1f9cf-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🙇')).toEqual(
        '<img draggable="false" class="emojione" alt="🙇" title=":bow:" src="/packs/emoji/1f647.svg" />',
      );
      expect(emojify('🙇‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🙇‍♂️" title=":man-bowing:" src="/packs/emoji/1f647-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🙇‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🙇‍♀️" title=":woman-bowing:" src="/packs/emoji/1f647-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🤦')).toEqual(
        '<img draggable="false" class="emojione" alt="🤦" title=":face_palm:" src="/packs/emoji/1f926.svg" />',
      );
      expect(emojify('🤦‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🤦‍♂️" title=":man-facepalming:" src="/packs/emoji/1f926-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🤦‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🤦‍♀️" title=":woman-facepalming:" src="/packs/emoji/1f926-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🤷')).toEqual(
        '<img draggable="false" class="emojione" alt="🤷" title=":shrug:" src="/packs/emoji/1f937.svg" />',
      );
      expect(emojify('🤷‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🤷‍♂️" title=":man-shrugging:" src="/packs/emoji/1f937-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🤷‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🤷‍♀️" title=":woman-shrugging:" src="/packs/emoji/1f937-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🧑‍⚕️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍⚕️" title=":health_worker:" src="/packs/emoji/1f9d1-200d-2695-fe0f.svg" />',
      );
      expect(emojify('👨‍⚕️')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍⚕️" title=":male-doctor:" src="/packs/emoji/1f468-200d-2695-fe0f.svg" />',
      );
      expect(emojify('👩‍⚕️')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍⚕️" title=":female-doctor:" src="/packs/emoji/1f469-200d-2695-fe0f.svg" />',
      );
      expect(emojify('🧑‍🎓')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🎓" title=":student:" src="/packs/emoji/1f9d1-200d-1f393.svg" />',
      );
      expect(emojify('👨‍🎓')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🎓" title=":male-student:" src="/packs/emoji/1f468-200d-1f393.svg" />',
      );
      expect(emojify('👩‍🎓')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🎓" title=":female-student:" src="/packs/emoji/1f469-200d-1f393.svg" />',
      );
      expect(emojify('🧑‍🏫')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🏫" title=":teacher:" src="/packs/emoji/1f9d1-200d-1f3eb.svg" />',
      );
      expect(emojify('👨‍🏫')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🏫" title=":male-teacher:" src="/packs/emoji/1f468-200d-1f3eb.svg" />',
      );
      expect(emojify('👩‍🏫')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🏫" title=":female-teacher:" src="/packs/emoji/1f469-200d-1f3eb.svg" />',
      );
      expect(emojify('🧑‍⚖️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍⚖️" title=":judge:" src="/packs/emoji/1f9d1-200d-2696-fe0f.svg" />',
      );
      expect(emojify('👨‍⚖️')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍⚖️" title=":male-judge:" src="/packs/emoji/1f468-200d-2696-fe0f.svg" />',
      );
      expect(emojify('👩‍⚖️')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍⚖️" title=":female-judge:" src="/packs/emoji/1f469-200d-2696-fe0f.svg" />',
      );
      expect(emojify('🧑‍🌾')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🌾" title=":farmer:" src="/packs/emoji/1f9d1-200d-1f33e.svg" />',
      );
      expect(emojify('👨‍🌾')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🌾" title=":male-farmer:" src="/packs/emoji/1f468-200d-1f33e.svg" />',
      );
      expect(emojify('👩‍🌾')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🌾" title=":female-farmer:" src="/packs/emoji/1f469-200d-1f33e.svg" />',
      );
      expect(emojify('🧑‍🍳')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🍳" title=":cook:" src="/packs/emoji/1f9d1-200d-1f373.svg" />',
      );
      expect(emojify('👨‍🍳')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🍳" title=":male-cook:" src="/packs/emoji/1f468-200d-1f373.svg" />',
      );
      expect(emojify('👩‍🍳')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🍳" title=":female-cook:" src="/packs/emoji/1f469-200d-1f373.svg" />',
      );
      expect(emojify('🧑‍🔧')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🔧" title=":mechanic:" src="/packs/emoji/1f9d1-200d-1f527.svg" />',
      );
      expect(emojify('👨‍🔧')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🔧" title=":male-mechanic:" src="/packs/emoji/1f468-200d-1f527.svg" />',
      );
      expect(emojify('👩‍🔧')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🔧" title=":female-mechanic:" src="/packs/emoji/1f469-200d-1f527.svg" />',
      );
      expect(emojify('🧑‍🏭')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🏭" title=":factory_worker:" src="/packs/emoji/1f9d1-200d-1f3ed.svg" />',
      );
      expect(emojify('👨‍🏭')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🏭" title=":male-factory-worker:" src="/packs/emoji/1f468-200d-1f3ed.svg" />',
      );
      expect(emojify('👩‍🏭')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🏭" title=":female-factory-worker:" src="/packs/emoji/1f469-200d-1f3ed.svg" />',
      );
      expect(emojify('🧑‍💼')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍💼" title=":office_worker:" src="/packs/emoji/1f9d1-200d-1f4bc.svg" />',
      );
      expect(emojify('👨‍💼')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍💼" title=":male-office-worker:" src="/packs/emoji/1f468-200d-1f4bc.svg" />',
      );
      expect(emojify('👩‍💼')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍💼" title=":female-office-worker:" src="/packs/emoji/1f469-200d-1f4bc.svg" />',
      );
      expect(emojify('🧑‍🔬')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🔬" title=":scientist:" src="/packs/emoji/1f9d1-200d-1f52c.svg" />',
      );
      expect(emojify('👨‍🔬')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🔬" title=":male-scientist:" src="/packs/emoji/1f468-200d-1f52c.svg" />',
      );
      expect(emojify('👩‍🔬')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🔬" title=":female-scientist:" src="/packs/emoji/1f469-200d-1f52c.svg" />',
      );
      expect(emojify('🧑‍💻')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍💻" title=":technologist:" src="/packs/emoji/1f9d1-200d-1f4bb.svg" />',
      );
      expect(emojify('👨‍💻')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍💻" title=":male-technologist:" src="/packs/emoji/1f468-200d-1f4bb.svg" />',
      );
      expect(emojify('👩‍💻')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍💻" title=":female-technologist:" src="/packs/emoji/1f469-200d-1f4bb.svg" />',
      );
      expect(emojify('🧑‍🎤')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🎤" title=":singer:" src="/packs/emoji/1f9d1-200d-1f3a4.svg" />',
      );
      expect(emojify('👨‍🎤')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🎤" title=":male-singer:" src="/packs/emoji/1f468-200d-1f3a4.svg" />',
      );
      expect(emojify('👩‍🎤')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🎤" title=":female-singer:" src="/packs/emoji/1f469-200d-1f3a4.svg" />',
      );
      expect(emojify('🧑‍🎨')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🎨" title=":artist:" src="/packs/emoji/1f9d1-200d-1f3a8.svg" />',
      );
      expect(emojify('👨‍🎨')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🎨" title=":male-artist:" src="/packs/emoji/1f468-200d-1f3a8.svg" />',
      );
      expect(emojify('👩‍🎨')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🎨" title=":female-artist:" src="/packs/emoji/1f469-200d-1f3a8.svg" />',
      );
      expect(emojify('🧑‍✈️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍✈️" title=":pilot:" src="/packs/emoji/1f9d1-200d-2708-fe0f.svg" />',
      );
      expect(emojify('👨‍✈️')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍✈️" title=":male-pilot:" src="/packs/emoji/1f468-200d-2708-fe0f.svg" />',
      );
      expect(emojify('👩‍✈️')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍✈️" title=":female-pilot:" src="/packs/emoji/1f469-200d-2708-fe0f.svg" />',
      );
      expect(emojify('🧑‍🚀')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🚀" title=":astronaut:" src="/packs/emoji/1f9d1-200d-1f680.svg" />',
      );
      expect(emojify('👨‍🚀')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🚀" title=":male-astronaut:" src="/packs/emoji/1f468-200d-1f680.svg" />',
      );
      expect(emojify('👩‍🚀')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🚀" title=":female-astronaut:" src="/packs/emoji/1f469-200d-1f680.svg" />',
      );
      expect(emojify('🧑‍🚒')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🚒" title=":firefighter:" src="/packs/emoji/1f9d1-200d-1f692.svg" />',
      );
      expect(emojify('👨‍🚒')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🚒" title=":male-firefighter:" src="/packs/emoji/1f468-200d-1f692.svg" />',
      );
      expect(emojify('👩‍🚒')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🚒" title=":female-firefighter:" src="/packs/emoji/1f469-200d-1f692.svg" />',
      );
      expect(emojify('👮')).toEqual(
        '<img draggable="false" class="emojione" alt="👮" title=":cop:" src="/packs/emoji/1f46e.svg" />',
      );
      expect(emojify('👮‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="👮‍♂️" title=":male-police-officer:" src="/packs/emoji/1f46e-200d-2642-fe0f.svg" />',
      );
      expect(emojify('👮‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="👮‍♀️" title=":female-police-officer:" src="/packs/emoji/1f46e-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🕵️')).toEqual(
        '<img draggable="false" class="emojione" alt="🕵️" title=":sleuth_or_spy:" src="/packs/emoji/1f575.svg" />',
      );
      expect(emojify('🕵️‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🕵️‍♂️" title=":male-detective:" src="/packs/emoji/1f575-fe0f-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🕵️‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🕵️‍♀️" title=":female-detective:" src="/packs/emoji/1f575-fe0f-200d-2640-fe0f.svg" />',
      );
      expect(emojify('💂')).toEqual(
        '<img draggable="false" class="emojione" alt="💂" title=":guardsman:" src="/packs/emoji/1f482.svg" />',
      );
      expect(emojify('💂‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="💂‍♂️" title=":male-guard:" src="/packs/emoji/1f482-200d-2642-fe0f.svg" />',
      );
      expect(emojify('💂‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="💂‍♀️" title=":female-guard:" src="/packs/emoji/1f482-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🥷')).toEqual(
        '<img draggable="false" class="emojione" alt="🥷" title=":ninja:" src="/packs/emoji/1f977.svg" />',
      );
      expect(emojify('👷')).toEqual(
        '<img draggable="false" class="emojione" alt="👷" title=":construction_worker:" src="/packs/emoji/1f477.svg" />',
      );
      expect(emojify('👷‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="👷‍♂️" title=":male-construction-worker:" src="/packs/emoji/1f477-200d-2642-fe0f.svg" />',
      );
      expect(emojify('👷‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="👷‍♀️" title=":female-construction-worker:" src="/packs/emoji/1f477-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🫅')).toEqual(
        '<img draggable="false" class="emojione" alt="🫅" title=":person_with_crown:" src="/packs/emoji/1fac5.svg" />',
      );
      expect(emojify('🤴')).toEqual(
        '<img draggable="false" class="emojione" alt="🤴" title=":prince:" src="/packs/emoji/1f934.svg" />',
      );
      expect(emojify('👸')).toEqual(
        '<img draggable="false" class="emojione" alt="👸" title=":princess:" src="/packs/emoji/1f478.svg" />',
      );
      expect(emojify('👳')).toEqual(
        '<img draggable="false" class="emojione" alt="👳" title=":man_with_turban:" src="/packs/emoji/1f473.svg" />',
      );
      expect(emojify('👳‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="👳‍♂️" title=":man-wearing-turban:" src="/packs/emoji/1f473-200d-2642-fe0f.svg" />',
      );
      expect(emojify('👳‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="👳‍♀️" title=":woman-wearing-turban:" src="/packs/emoji/1f473-200d-2640-fe0f.svg" />',
      );
      expect(emojify('👲')).toEqual(
        '<img draggable="false" class="emojione" alt="👲" title=":man_with_gua_pi_mao:" src="/packs/emoji/1f472.svg" />',
      );
      expect(emojify('🧕')).toEqual(
        '<img draggable="false" class="emojione" alt="🧕" title=":person_with_headscarf:" src="/packs/emoji/1f9d5.svg" />',
      );
      expect(emojify('🤵')).toEqual(
        '<img draggable="false" class="emojione" alt="🤵" title=":person_in_tuxedo:" src="/packs/emoji/1f935.svg" />',
      );
      expect(emojify('🤵‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🤵‍♂️" title=":man_in_tuxedo:" src="/packs/emoji/1f935-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🤵‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🤵‍♀️" title=":woman_in_tuxedo:" src="/packs/emoji/1f935-200d-2640-fe0f.svg" />',
      );
      expect(emojify('👰')).toEqual(
        '<img draggable="false" class="emojione" alt="👰" title=":bride_with_veil:" src="/packs/emoji/1f470.svg" />',
      );
      expect(emojify('👰‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="👰‍♂️" title=":man_with_veil:" src="/packs/emoji/1f470-200d-2642-fe0f.svg" />',
      );
      expect(emojify('👰‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="👰‍♀️" title=":woman_with_veil:" src="/packs/emoji/1f470-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🤰')).toEqual(
        '<img draggable="false" class="emojione" alt="🤰" title=":pregnant_woman:" src="/packs/emoji/1f930.svg" />',
      );
      expect(emojify('🫃')).toEqual(
        '<img draggable="false" class="emojione" alt="🫃" title=":pregnant_man:" src="/packs/emoji/1fac3.svg" />',
      );
      expect(emojify('🫄')).toEqual(
        '<img draggable="false" class="emojione" alt="🫄" title=":pregnant_person:" src="/packs/emoji/1fac4.svg" />',
      );
      expect(emojify('🤱')).toEqual(
        '<img draggable="false" class="emojione" alt="🤱" title=":breast-feeding:" src="/packs/emoji/1f931.svg" />',
      );
      expect(emojify('👩‍🍼')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🍼" title=":woman_feeding_baby:" src="/packs/emoji/1f469-200d-1f37c.svg" />',
      );
      expect(emojify('👨‍🍼')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🍼" title=":man_feeding_baby:" src="/packs/emoji/1f468-200d-1f37c.svg" />',
      );
      expect(emojify('🧑‍🍼')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🍼" title=":person_feeding_baby:" src="/packs/emoji/1f9d1-200d-1f37c.svg" />',
      );
      expect(emojify('👼')).toEqual(
        '<img draggable="false" class="emojione" alt="👼" title=":angel:" src="/packs/emoji/1f47c.svg" />',
      );
      expect(emojify('🎅')).toEqual(
        '<img draggable="false" class="emojione" alt="🎅" title=":santa:" src="/packs/emoji/1f385.svg" />',
      );
      expect(emojify('🤶')).toEqual(
        '<img draggable="false" class="emojione" alt="🤶" title=":mrs_claus:" src="/packs/emoji/1f936.svg" />',
      );
      expect(emojify('🧑‍🎄')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🎄" title=":mx_claus:" src="/packs/emoji/1f9d1-200d-1f384.svg" />',
      );
      expect(emojify('🦸')).toEqual(
        '<img draggable="false" class="emojione" alt="🦸" title=":superhero:" src="/packs/emoji/1f9b8.svg" />',
      );
      expect(emojify('🦸‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🦸‍♂️" title=":male_superhero:" src="/packs/emoji/1f9b8-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🦸‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🦸‍♀️" title=":female_superhero:" src="/packs/emoji/1f9b8-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🦹')).toEqual(
        '<img draggable="false" class="emojione" alt="🦹" title=":supervillain:" src="/packs/emoji/1f9b9.svg" />',
      );
      expect(emojify('🦹‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🦹‍♂️" title=":male_supervillain:" src="/packs/emoji/1f9b9-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🦹‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🦹‍♀️" title=":female_supervillain:" src="/packs/emoji/1f9b9-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🧙')).toEqual(
        '<img draggable="false" class="emojione" alt="🧙" title=":mage:" src="/packs/emoji/1f9d9.svg" />',
      );
      expect(emojify('🧙‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧙‍♂️" title=":male_mage:" src="/packs/emoji/1f9d9-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🧙‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧙‍♀️" title=":female_mage:" src="/packs/emoji/1f9d9-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🧚')).toEqual(
        '<img draggable="false" class="emojione" alt="🧚" title=":fairy:" src="/packs/emoji/1f9da.svg" />',
      );
      expect(emojify('🧚‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧚‍♂️" title=":male_fairy:" src="/packs/emoji/1f9da-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🧚‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧚‍♀️" title=":female_fairy:" src="/packs/emoji/1f9da-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🧛')).toEqual(
        '<img draggable="false" class="emojione" alt="🧛" title=":vampire:" src="/packs/emoji/1f9db.svg" />',
      );
      expect(emojify('🧛‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧛‍♂️" title=":male_vampire:" src="/packs/emoji/1f9db-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🧛‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧛‍♀️" title=":female_vampire:" src="/packs/emoji/1f9db-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🧜')).toEqual(
        '<img draggable="false" class="emojione" alt="🧜" title=":merperson:" src="/packs/emoji/1f9dc.svg" />',
      );
      expect(emojify('🧜‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧜‍♂️" title=":merman:" src="/packs/emoji/1f9dc-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🧜‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧜‍♀️" title=":mermaid:" src="/packs/emoji/1f9dc-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🧝')).toEqual(
        '<img draggable="false" class="emojione" alt="🧝" title=":elf:" src="/packs/emoji/1f9dd.svg" />',
      );
      expect(emojify('🧝‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧝‍♂️" title=":male_elf:" src="/packs/emoji/1f9dd-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🧝‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧝‍♀️" title=":female_elf:" src="/packs/emoji/1f9dd-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🧞')).toEqual(
        '<img draggable="false" class="emojione" alt="🧞" title=":genie:" src="/packs/emoji/1f9de.svg" />',
      );
      expect(emojify('🧞‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧞‍♂️" title=":male_genie:" src="/packs/emoji/1f9de-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🧞‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧞‍♀️" title=":female_genie:" src="/packs/emoji/1f9de-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🧟')).toEqual(
        '<img draggable="false" class="emojione" alt="🧟" title=":zombie:" src="/packs/emoji/1f9df.svg" />',
      );
      expect(emojify('🧟‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧟‍♂️" title=":male_zombie:" src="/packs/emoji/1f9df-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🧟‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧟‍♀️" title=":female_zombie:" src="/packs/emoji/1f9df-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🧌')).toEqual(
        '<img draggable="false" class="emojione" alt="🧌" title=":troll:" src="/packs/emoji/1f9cc.svg" />',
      );
      expect(emojify('💆')).toEqual(
        '<img draggable="false" class="emojione" alt="💆" title=":massage:" src="/packs/emoji/1f486.svg" />',
      );
      expect(emojify('💆‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="💆‍♂️" title=":man-getting-massage:" src="/packs/emoji/1f486-200d-2642-fe0f.svg" />',
      );
      expect(emojify('💆‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="💆‍♀️" title=":woman-getting-massage:" src="/packs/emoji/1f486-200d-2640-fe0f.svg" />',
      );
      expect(emojify('💇')).toEqual(
        '<img draggable="false" class="emojione" alt="💇" title=":haircut:" src="/packs/emoji/1f487.svg" />',
      );
      expect(emojify('💇‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="💇‍♂️" title=":man-getting-haircut:" src="/packs/emoji/1f487-200d-2642-fe0f.svg" />',
      );
      expect(emojify('💇‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="💇‍♀️" title=":woman-getting-haircut:" src="/packs/emoji/1f487-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🚶')).toEqual(
        '<img draggable="false" class="emojione" alt="🚶" title=":walking:" src="/packs/emoji/1f6b6.svg" />',
      );
      expect(emojify('🚶‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🚶‍♂️" title=":man-walking:" src="/packs/emoji/1f6b6-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🚶‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🚶‍♀️" title=":woman-walking:" src="/packs/emoji/1f6b6-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🧍')).toEqual(
        '<img draggable="false" class="emojione" alt="🧍" title=":standing_person:" src="/packs/emoji/1f9cd.svg" />',
      );
      expect(emojify('🧍‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧍‍♂️" title=":man_standing:" src="/packs/emoji/1f9cd-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🧍‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧍‍♀️" title=":woman_standing:" src="/packs/emoji/1f9cd-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🧎')).toEqual(
        '<img draggable="false" class="emojione" alt="🧎" title=":kneeling_person:" src="/packs/emoji/1f9ce.svg" />',
      );
      expect(emojify('🧎‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧎‍♂️" title=":man_kneeling:" src="/packs/emoji/1f9ce-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🧎‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧎‍♀️" title=":woman_kneeling:" src="/packs/emoji/1f9ce-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🧑‍🦯')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🦯" title=":person_with_probing_cane:" src="/packs/emoji/1f9d1-200d-1f9af.svg" />',
      );
      expect(emojify('👨‍🦯')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🦯" title=":man_with_probing_cane:" src="/packs/emoji/1f468-200d-1f9af.svg" />',
      );
      expect(emojify('👩‍🦯')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🦯" title=":woman_with_probing_cane:" src="/packs/emoji/1f469-200d-1f9af.svg" />',
      );
      expect(emojify('🧑‍🦼')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🦼" title=":person_in_motorized_wheelchair:" src="/packs/emoji/1f9d1-200d-1f9bc.svg" />',
      );
      expect(emojify('👨‍🦼')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🦼" title=":man_in_motorized_wheelchair:" src="/packs/emoji/1f468-200d-1f9bc.svg" />',
      );
      expect(emojify('👩‍🦼')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🦼" title=":woman_in_motorized_wheelchair:" src="/packs/emoji/1f469-200d-1f9bc.svg" />',
      );
      expect(emojify('🧑‍🦽')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🦽" title=":person_in_manual_wheelchair:" src="/packs/emoji/1f9d1-200d-1f9bd.svg" />',
      );
      expect(emojify('👨‍🦽')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍🦽" title=":man_in_manual_wheelchair:" src="/packs/emoji/1f468-200d-1f9bd.svg" />',
      );
      expect(emojify('👩‍🦽')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍🦽" title=":woman_in_manual_wheelchair:" src="/packs/emoji/1f469-200d-1f9bd.svg" />',
      );
      expect(emojify('🏃')).toEqual(
        '<img draggable="false" class="emojione" alt="🏃" title=":runner:" src="/packs/emoji/1f3c3.svg" />',
      );
      expect(emojify('🏃‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏃‍♂️" title=":man-running:" src="/packs/emoji/1f3c3-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🏃‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏃‍♀️" title=":woman-running:" src="/packs/emoji/1f3c3-200d-2640-fe0f.svg" />',
      );
      expect(emojify('💃')).toEqual(
        '<img draggable="false" class="emojione" alt="💃" title=":dancer:" src="/packs/emoji/1f483.svg" />',
      );
      expect(emojify('🕺')).toEqual(
        '<img draggable="false" class="emojione" alt="🕺" title=":man_dancing:" src="/packs/emoji/1f57a.svg" />',
      );
      expect(emojify('🕴️')).toEqual(
        '<img draggable="false" class="emojione" alt="🕴️" title=":man_in_business_suit_levitating:" src="/packs/emoji/1f574.svg" />',
      );
      expect(emojify('👯')).toEqual(
        '<img draggable="false" class="emojione" alt="👯" title=":dancers:" src="/packs/emoji/1f46f.svg" />',
      );
      expect(emojify('👯‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="👯‍♂️" title=":men-with-bunny-ears-partying:" src="/packs/emoji/1f46f-200d-2642-fe0f.svg" />',
      );
      expect(emojify('👯‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="👯‍♀️" title=":women-with-bunny-ears-partying:" src="/packs/emoji/1f46f-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🧖')).toEqual(
        '<img draggable="false" class="emojione" alt="🧖" title=":person_in_steamy_room:" src="/packs/emoji/1f9d6.svg" />',
      );
      expect(emojify('🧖‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧖‍♂️" title=":man_in_steamy_room:" src="/packs/emoji/1f9d6-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🧖‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧖‍♀️" title=":woman_in_steamy_room:" src="/packs/emoji/1f9d6-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🧗')).toEqual(
        '<img draggable="false" class="emojione" alt="🧗" title=":person_climbing:" src="/packs/emoji/1f9d7.svg" />',
      );
      expect(emojify('🧗‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧗‍♂️" title=":man_climbing:" src="/packs/emoji/1f9d7-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🧗‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧗‍♀️" title=":woman_climbing:" src="/packs/emoji/1f9d7-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🤺')).toEqual(
        '<img draggable="false" class="emojione" alt="🤺" title=":fencer:" src="/packs/emoji/1f93a.svg" />',
      );
      expect(emojify('🏇')).toEqual(
        '<img draggable="false" class="emojione" alt="🏇" title=":horse_racing:" src="/packs/emoji/1f3c7.svg" />',
      );
      expect(emojify('⛷️')).toEqual(
        '<img draggable="false" class="emojione" alt="⛷️" title=":skier:" src="/packs/emoji/26f7.svg" />',
      );
      expect(emojify('🏂')).toEqual(
        '<img draggable="false" class="emojione" alt="🏂" title=":snowboarder:" src="/packs/emoji/1f3c2.svg" />',
      );
      expect(emojify('🏌️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏌️" title=":golfer:" src="/packs/emoji/1f3cc.svg" />',
      );
      expect(emojify('🏌️‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏌️‍♂️" title=":man-golfing:" src="/packs/emoji/1f3cc-fe0f-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🏌️‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏌️‍♀️" title=":woman-golfing:" src="/packs/emoji/1f3cc-fe0f-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🏄')).toEqual(
        '<img draggable="false" class="emojione" alt="🏄" title=":surfer:" src="/packs/emoji/1f3c4.svg" />',
      );
      expect(emojify('🏄‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏄‍♂️" title=":man-surfing:" src="/packs/emoji/1f3c4-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🏄‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏄‍♀️" title=":woman-surfing:" src="/packs/emoji/1f3c4-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🚣')).toEqual(
        '<img draggable="false" class="emojione" alt="🚣" title=":rowboat:" src="/packs/emoji/1f6a3.svg" />',
      );
      expect(emojify('🚣‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🚣‍♂️" title=":man-rowing-boat:" src="/packs/emoji/1f6a3-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🚣‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🚣‍♀️" title=":woman-rowing-boat:" src="/packs/emoji/1f6a3-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🏊')).toEqual(
        '<img draggable="false" class="emojione" alt="🏊" title=":swimmer:" src="/packs/emoji/1f3ca.svg" />',
      );
      expect(emojify('🏊‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏊‍♂️" title=":man-swimming:" src="/packs/emoji/1f3ca-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🏊‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏊‍♀️" title=":woman-swimming:" src="/packs/emoji/1f3ca-200d-2640-fe0f.svg" />',
      );
      expect(emojify('⛹️')).toEqual(
        '<img draggable="false" class="emojione" alt="⛹️" title=":person_with_ball:" src="/packs/emoji/26f9.svg" />',
      );
      expect(emojify('⛹️‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="⛹️‍♂️" title=":man-bouncing-ball:" src="/packs/emoji/26f9-fe0f-200d-2642-fe0f.svg" />',
      );
      expect(emojify('⛹️‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="⛹️‍♀️" title=":woman-bouncing-ball:" src="/packs/emoji/26f9-fe0f-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🏋️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏋️" title=":weight_lifter:" src="/packs/emoji/1f3cb.svg" />',
      );
      expect(emojify('🏋️‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏋️‍♂️" title=":man-lifting-weights:" src="/packs/emoji/1f3cb-fe0f-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🏋️‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏋️‍♀️" title=":woman-lifting-weights:" src="/packs/emoji/1f3cb-fe0f-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🚴')).toEqual(
        '<img draggable="false" class="emojione" alt="🚴" title=":bicyclist:" src="/packs/emoji/1f6b4.svg" />',
      );
      expect(emojify('🚴‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🚴‍♂️" title=":man-biking:" src="/packs/emoji/1f6b4-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🚴‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🚴‍♀️" title=":woman-biking:" src="/packs/emoji/1f6b4-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🚵')).toEqual(
        '<img draggable="false" class="emojione" alt="🚵" title=":mountain_bicyclist:" src="/packs/emoji/1f6b5.svg" />',
      );
      expect(emojify('🚵‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🚵‍♂️" title=":man-mountain-biking:" src="/packs/emoji/1f6b5-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🚵‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🚵‍♀️" title=":woman-mountain-biking:" src="/packs/emoji/1f6b5-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🤸')).toEqual(
        '<img draggable="false" class="emojione" alt="🤸" title=":person_doing_cartwheel:" src="/packs/emoji/1f938.svg" />',
      );
      expect(emojify('🤸‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🤸‍♂️" title=":man-cartwheeling:" src="/packs/emoji/1f938-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🤸‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🤸‍♀️" title=":woman-cartwheeling:" src="/packs/emoji/1f938-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🤼')).toEqual(
        '<img draggable="false" class="emojione" alt="🤼" title=":wrestlers:" src="/packs/emoji/1f93c.svg" />',
      );
      expect(emojify('🤼‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🤼‍♂️" title=":man-wrestling:" src="/packs/emoji/1f93c-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🤼‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🤼‍♀️" title=":woman-wrestling:" src="/packs/emoji/1f93c-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🤽')).toEqual(
        '<img draggable="false" class="emojione" alt="🤽" title=":water_polo:" src="/packs/emoji/1f93d.svg" />',
      );
      expect(emojify('🤽‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🤽‍♂️" title=":man-playing-water-polo:" src="/packs/emoji/1f93d-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🤽‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🤽‍♀️" title=":woman-playing-water-polo:" src="/packs/emoji/1f93d-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🤾')).toEqual(
        '<img draggable="false" class="emojione" alt="🤾" title=":handball:" src="/packs/emoji/1f93e.svg" />',
      );
      expect(emojify('🤾‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🤾‍♂️" title=":man-playing-handball:" src="/packs/emoji/1f93e-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🤾‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🤾‍♀️" title=":woman-playing-handball:" src="/packs/emoji/1f93e-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🤹')).toEqual(
        '<img draggable="false" class="emojione" alt="🤹" title=":juggling:" src="/packs/emoji/1f939.svg" />',
      );
      expect(emojify('🤹‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🤹‍♂️" title=":man-juggling:" src="/packs/emoji/1f939-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🤹‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🤹‍♀️" title=":woman-juggling:" src="/packs/emoji/1f939-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🧘')).toEqual(
        '<img draggable="false" class="emojione" alt="🧘" title=":person_in_lotus_position:" src="/packs/emoji/1f9d8.svg" />',
      );
      expect(emojify('🧘‍♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧘‍♂️" title=":man_in_lotus_position:" src="/packs/emoji/1f9d8-200d-2642-fe0f.svg" />',
      );
      expect(emojify('🧘‍♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="🧘‍♀️" title=":woman_in_lotus_position:" src="/packs/emoji/1f9d8-200d-2640-fe0f.svg" />',
      );
      expect(emojify('🛀')).toEqual(
        '<img draggable="false" class="emojione" alt="🛀" title=":bath:" src="/packs/emoji/1f6c0.svg" />',
      );
      expect(emojify('🛌')).toEqual(
        '<img draggable="false" class="emojione" alt="🛌" title=":sleeping_accommodation:" src="/packs/emoji/1f6cc.svg" />',
      );
      expect(emojify('🧑‍🤝‍🧑')).toEqual(
        '<img draggable="false" class="emojione" alt="🧑‍🤝‍🧑" title=":people_holding_hands:" src="/packs/emoji/1f9d1-200d-1f91d-200d-1f9d1.svg" />',
      );
      expect(emojify('👭')).toEqual(
        '<img draggable="false" class="emojione" alt="👭" title=":two_women_holding_hands:" src="/packs/emoji/1f46d.svg" />',
      );
      expect(emojify('👫')).toEqual(
        '<img draggable="false" class="emojione" alt="👫" title=":man_and_woman_holding_hands:" src="/packs/emoji/1f46b.svg" />',
      );
      expect(emojify('👬')).toEqual(
        '<img draggable="false" class="emojione" alt="👬" title=":two_men_holding_hands:" src="/packs/emoji/1f46c.svg" />',
      );
      expect(emojify('💏')).toEqual(
        '<img draggable="false" class="emojione" alt="💏" title=":couplekiss:" src="/packs/emoji/1f48f.svg" />',
      );
      expect(emojify('👩‍❤️‍💋‍👨')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍❤️‍💋‍👨" title=":woman-kiss-man:" src="/packs/emoji/1f469-200d-2764-fe0f-200d-1f48b-200d-1f468.svg" />',
      );
      expect(emojify('👨‍❤️‍💋‍👨')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍❤️‍💋‍👨" title=":man-kiss-man:" src="/packs/emoji/1f468-200d-2764-fe0f-200d-1f48b-200d-1f468.svg" />',
      );
      expect(emojify('👩‍❤️‍💋‍👩')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍❤️‍💋‍👩" title=":woman-kiss-woman:" src="/packs/emoji/1f469-200d-2764-fe0f-200d-1f48b-200d-1f469.svg" />',
      );
      expect(emojify('💑')).toEqual(
        '<img draggable="false" class="emojione" alt="💑" title=":couple_with_heart:" src="/packs/emoji/1f491.svg" />',
      );
      expect(emojify('👩‍❤️‍👨')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍❤️‍👨" title=":woman-heart-man:" src="/packs/emoji/1f469-200d-2764-fe0f-200d-1f468.svg" />',
      );
      expect(emojify('👨‍❤️‍👨')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍❤️‍👨" title=":man-heart-man:" src="/packs/emoji/1f468-200d-2764-fe0f-200d-1f468.svg" />',
      );
      expect(emojify('👩‍❤️‍👩')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍❤️‍👩" title=":woman-heart-woman:" src="/packs/emoji/1f469-200d-2764-fe0f-200d-1f469.svg" />',
      );
      expect(emojify('👪')).toEqual(
        '<img draggable="false" class="emojione" alt="👪" title=":family:" src="/packs/emoji/1f46a.svg" />',
      );
      expect(emojify('👨‍👩‍👦')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍👩‍👦" title=":man-woman-boy:" src="/packs/emoji/1f468-200d-1f469-200d-1f466.svg" />',
      );
      expect(emojify('👨‍👩‍👧')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍👩‍👧" title=":man-woman-girl:" src="/packs/emoji/1f468-200d-1f469-200d-1f467.svg" />',
      );
      expect(emojify('👨‍👩‍👧‍👦')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍👩‍👧‍👦" title=":man-woman-girl-boy:" src="/packs/emoji/1f468-200d-1f469-200d-1f467-200d-1f466.svg" />',
      );
      expect(emojify('👨‍👩‍👦‍👦')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍👩‍👦‍👦" title=":man-woman-boy-boy:" src="/packs/emoji/1f468-200d-1f469-200d-1f466-200d-1f466.svg" />',
      );
      expect(emojify('👨‍👩‍👧‍👧')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍👩‍👧‍👧" title=":man-woman-girl-girl:" src="/packs/emoji/1f468-200d-1f469-200d-1f467-200d-1f467.svg" />',
      );
      expect(emojify('👨‍👨‍👦')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍👨‍👦" title=":man-man-boy:" src="/packs/emoji/1f468-200d-1f468-200d-1f466.svg" />',
      );
      expect(emojify('👨‍👨‍👧')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍👨‍👧" title=":man-man-girl:" src="/packs/emoji/1f468-200d-1f468-200d-1f467.svg" />',
      );
      expect(emojify('👨‍👨‍👧‍👦')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍👨‍👧‍👦" title=":man-man-girl-boy:" src="/packs/emoji/1f468-200d-1f468-200d-1f467-200d-1f466.svg" />',
      );
      expect(emojify('👨‍👨‍👦‍👦')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍👨‍👦‍👦" title=":man-man-boy-boy:" src="/packs/emoji/1f468-200d-1f468-200d-1f466-200d-1f466.svg" />',
      );
      expect(emojify('👨‍👨‍👧‍👧')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍👨‍👧‍👧" title=":man-man-girl-girl:" src="/packs/emoji/1f468-200d-1f468-200d-1f467-200d-1f467.svg" />',
      );
      expect(emojify('👩‍👩‍👦')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍👩‍👦" title=":woman-woman-boy:" src="/packs/emoji/1f469-200d-1f469-200d-1f466.svg" />',
      );
      expect(emojify('👩‍👩‍👧')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍👩‍👧" title=":woman-woman-girl:" src="/packs/emoji/1f469-200d-1f469-200d-1f467.svg" />',
      );
      expect(emojify('👩‍👩‍👧‍👦')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍👩‍👧‍👦" title=":woman-woman-girl-boy:" src="/packs/emoji/1f469-200d-1f469-200d-1f467-200d-1f466.svg" />',
      );
      expect(emojify('👩‍👩‍👦‍👦')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍👩‍👦‍👦" title=":woman-woman-boy-boy:" src="/packs/emoji/1f469-200d-1f469-200d-1f466-200d-1f466.svg" />',
      );
      expect(emojify('👩‍👩‍👧‍👧')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍👩‍👧‍👧" title=":woman-woman-girl-girl:" src="/packs/emoji/1f469-200d-1f469-200d-1f467-200d-1f467.svg" />',
      );
      expect(emojify('👨‍👦')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍👦" title=":man-boy:" src="/packs/emoji/1f468-200d-1f466.svg" />',
      );
      expect(emojify('👨‍👦‍👦')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍👦‍👦" title=":man-boy-boy:" src="/packs/emoji/1f468-200d-1f466-200d-1f466.svg" />',
      );
      expect(emojify('👨‍👧')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍👧" title=":man-girl:" src="/packs/emoji/1f468-200d-1f467.svg" />',
      );
      expect(emojify('👨‍👧‍👦')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍👧‍👦" title=":man-girl-boy:" src="/packs/emoji/1f468-200d-1f467-200d-1f466.svg" />',
      );
      expect(emojify('👨‍👧‍👧')).toEqual(
        '<img draggable="false" class="emojione" alt="👨‍👧‍👧" title=":man-girl-girl:" src="/packs/emoji/1f468-200d-1f467-200d-1f467.svg" />',
      );
      expect(emojify('👩‍👦')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍👦" title=":woman-boy:" src="/packs/emoji/1f469-200d-1f466.svg" />',
      );
      expect(emojify('👩‍👦‍👦')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍👦‍👦" title=":woman-boy-boy:" src="/packs/emoji/1f469-200d-1f466-200d-1f466.svg" />',
      );
      expect(emojify('👩‍👧')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍👧" title=":woman-girl:" src="/packs/emoji/1f469-200d-1f467.svg" />',
      );
      expect(emojify('👩‍👧‍👦')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍👧‍👦" title=":woman-girl-boy:" src="/packs/emoji/1f469-200d-1f467-200d-1f466.svg" />',
      );
      expect(emojify('👩‍👧‍👧')).toEqual(
        '<img draggable="false" class="emojione" alt="👩‍👧‍👧" title=":woman-girl-girl:" src="/packs/emoji/1f469-200d-1f467-200d-1f467.svg" />',
      );
      expect(emojify('🗣️')).toEqual(
        '<img draggable="false" class="emojione" alt="🗣️" title=":speaking_head_in_silhouette:" src="/packs/emoji/1f5e3.svg" />',
      );
      expect(emojify('👤')).toEqual(
        '<img draggable="false" class="emojione" alt="👤" title=":bust_in_silhouette:" src="/packs/emoji/1f464.svg" />',
      );
      expect(emojify('👥')).toEqual(
        '<img draggable="false" class="emojione" alt="👥" title=":busts_in_silhouette:" src="/packs/emoji/1f465.svg" />',
      );
      expect(emojify('🫂')).toEqual(
        '<img draggable="false" class="emojione" alt="🫂" title=":people_hugging:" src="/packs/emoji/1fac2.svg" />',
      );
      expect(emojify('👣')).toEqual(
        '<img draggable="false" class="emojione" alt="👣" title=":footprints:" src="/packs/emoji/1f463.svg" />',
      );
      expect(emojify('🐵')).toEqual(
        '<img draggable="false" class="emojione" alt="🐵" title=":monkey_face:" src="/packs/emoji/1f435.svg" />',
      );
      expect(emojify('🐒')).toEqual(
        '<img draggable="false" class="emojione" alt="🐒" title=":monkey:" src="/packs/emoji/1f412.svg" />',
      );
      expect(emojify('🦍')).toEqual(
        '<img draggable="false" class="emojione" alt="🦍" title=":gorilla:" src="/packs/emoji/1f98d.svg" />',
      );
      expect(emojify('🦧')).toEqual(
        '<img draggable="false" class="emojione" alt="🦧" title=":orangutan:" src="/packs/emoji/1f9a7.svg" />',
      );
      expect(emojify('🐶')).toEqual(
        '<img draggable="false" class="emojione" alt="🐶" title=":dog:" src="/packs/emoji/1f436.svg" />',
      );
      expect(emojify('🐕')).toEqual(
        '<img draggable="false" class="emojione" alt="🐕" title=":dog2:" src="/packs/emoji/1f415.svg" />',
      );
      expect(emojify('🦮')).toEqual(
        '<img draggable="false" class="emojione" alt="🦮" title=":guide_dog:" src="/packs/emoji/1f9ae.svg" />',
      );
      expect(emojify('🐕‍🦺')).toEqual(
        '<img draggable="false" class="emojione" alt="🐕‍🦺" title=":service_dog:" src="/packs/emoji/1f415-200d-1f9ba.svg" />',
      );
      expect(emojify('🐩')).toEqual(
        '<img draggable="false" class="emojione" alt="🐩" title=":poodle:" src="/packs/emoji/1f429.svg" />',
      );
      expect(emojify('🐺')).toEqual(
        '<img draggable="false" class="emojione" alt="🐺" title=":wolf:" src="/packs/emoji/1f43a.svg" />',
      );
      expect(emojify('🦊')).toEqual(
        '<img draggable="false" class="emojione" alt="🦊" title=":fox_face:" src="/packs/emoji/1f98a.svg" />',
      );
      expect(emojify('🦝')).toEqual(
        '<img draggable="false" class="emojione" alt="🦝" title=":raccoon:" src="/packs/emoji/1f99d.svg" />',
      );
      expect(emojify('🐱')).toEqual(
        '<img draggable="false" class="emojione" alt="🐱" title=":cat:" src="/packs/emoji/1f431.svg" />',
      );
      expect(emojify('🐈')).toEqual(
        '<img draggable="false" class="emojione" alt="🐈" title=":cat2:" src="/packs/emoji/1f408.svg" />',
      );
      expect(emojify('🐈‍⬛')).toEqual(
        '<img draggable="false" class="emojione" alt="🐈‍⬛" title=":black_cat:" src="/packs/emoji/1f408-200d-2b1b.svg" />',
      );
      expect(emojify('🦁')).toEqual(
        '<img draggable="false" class="emojione" alt="🦁" title=":lion_face:" src="/packs/emoji/1f981.svg" />',
      );
      expect(emojify('🐯')).toEqual(
        '<img draggable="false" class="emojione" alt="🐯" title=":tiger:" src="/packs/emoji/1f42f.svg" />',
      );
      expect(emojify('🐅')).toEqual(
        '<img draggable="false" class="emojione" alt="🐅" title=":tiger2:" src="/packs/emoji/1f405.svg" />',
      );
      expect(emojify('🐆')).toEqual(
        '<img draggable="false" class="emojione" alt="🐆" title=":leopard:" src="/packs/emoji/1f406.svg" />',
      );
      expect(emojify('🐴')).toEqual(
        '<img draggable="false" class="emojione" alt="🐴" title=":horse:" src="/packs/emoji/1f434.svg" />',
      );
      expect(emojify('🐎')).toEqual(
        '<img draggable="false" class="emojione" alt="🐎" title=":racehorse:" src="/packs/emoji/1f40e.svg" />',
      );
      expect(emojify('🦄')).toEqual(
        '<img draggable="false" class="emojione" alt="🦄" title=":unicorn_face:" src="/packs/emoji/1f984.svg" />',
      );
      expect(emojify('🦓')).toEqual(
        '<img draggable="false" class="emojione" alt="🦓" title=":zebra_face:" src="/packs/emoji/1f993.svg" />',
      );
      expect(emojify('🦌')).toEqual(
        '<img draggable="false" class="emojione" alt="🦌" title=":deer:" src="/packs/emoji/1f98c.svg" />',
      );
      expect(emojify('🦬')).toEqual(
        '<img draggable="false" class="emojione" alt="🦬" title=":bison:" src="/packs/emoji/1f9ac.svg" />',
      );
      expect(emojify('🐮')).toEqual(
        '<img draggable="false" class="emojione" alt="🐮" title=":cow:" src="/packs/emoji/1f42e.svg" />',
      );
      expect(emojify('🐂')).toEqual(
        '<img draggable="false" class="emojione" alt="🐂" title=":ox:" src="/packs/emoji/1f402.svg" />',
      );
      expect(emojify('🐃')).toEqual(
        '<img draggable="false" class="emojione" alt="🐃" title=":water_buffalo:" src="/packs/emoji/1f403.svg" />',
      );
      expect(emojify('🐄')).toEqual(
        '<img draggable="false" class="emojione" alt="🐄" title=":cow2:" src="/packs/emoji/1f404.svg" />',
      );
      expect(emojify('🐷')).toEqual(
        '<img draggable="false" class="emojione" alt="🐷" title=":pig:" src="/packs/emoji/1f437.svg" />',
      );
      expect(emojify('🐖')).toEqual(
        '<img draggable="false" class="emojione" alt="🐖" title=":pig2:" src="/packs/emoji/1f416.svg" />',
      );
      expect(emojify('🐗')).toEqual(
        '<img draggable="false" class="emojione" alt="🐗" title=":boar:" src="/packs/emoji/1f417.svg" />',
      );
      expect(emojify('🐽')).toEqual(
        '<img draggable="false" class="emojione" alt="🐽" title=":pig_nose:" src="/packs/emoji/1f43d.svg" />',
      );
      expect(emojify('🐏')).toEqual(
        '<img draggable="false" class="emojione" alt="🐏" title=":ram:" src="/packs/emoji/1f40f.svg" />',
      );
      expect(emojify('🐑')).toEqual(
        '<img draggable="false" class="emojione" alt="🐑" title=":sheep:" src="/packs/emoji/1f411.svg" />',
      );
      expect(emojify('🐐')).toEqual(
        '<img draggable="false" class="emojione" alt="🐐" title=":goat:" src="/packs/emoji/1f410.svg" />',
      );
      expect(emojify('🐪')).toEqual(
        '<img draggable="false" class="emojione" alt="🐪" title=":dromedary_camel:" src="/packs/emoji/1f42a.svg" />',
      );
      expect(emojify('🐫')).toEqual(
        '<img draggable="false" class="emojione" alt="🐫" title=":camel:" src="/packs/emoji/1f42b.svg" />',
      );
      expect(emojify('🦙')).toEqual(
        '<img draggable="false" class="emojione" alt="🦙" title=":llama:" src="/packs/emoji/1f999.svg" />',
      );
      expect(emojify('🦒')).toEqual(
        '<img draggable="false" class="emojione" alt="🦒" title=":giraffe_face:" src="/packs/emoji/1f992.svg" />',
      );
      expect(emojify('🐘')).toEqual(
        '<img draggable="false" class="emojione" alt="🐘" title=":elephant:" src="/packs/emoji/1f418.svg" />',
      );
      expect(emojify('🦣')).toEqual(
        '<img draggable="false" class="emojione" alt="🦣" title=":mammoth:" src="/packs/emoji/1f9a3.svg" />',
      );
      expect(emojify('🦏')).toEqual(
        '<img draggable="false" class="emojione" alt="🦏" title=":rhinoceros:" src="/packs/emoji/1f98f.svg" />',
      );
      expect(emojify('🦛')).toEqual(
        '<img draggable="false" class="emojione" alt="🦛" title=":hippopotamus:" src="/packs/emoji/1f99b.svg" />',
      );
      expect(emojify('🐭')).toEqual(
        '<img draggable="false" class="emojione" alt="🐭" title=":mouse:" src="/packs/emoji/1f42d.svg" />',
      );
      expect(emojify('🐁')).toEqual(
        '<img draggable="false" class="emojione" alt="🐁" title=":mouse2:" src="/packs/emoji/1f401.svg" />',
      );
      expect(emojify('🐀')).toEqual(
        '<img draggable="false" class="emojione" alt="🐀" title=":rat:" src="/packs/emoji/1f400.svg" />',
      );
      expect(emojify('🐹')).toEqual(
        '<img draggable="false" class="emojione" alt="🐹" title=":hamster:" src="/packs/emoji/1f439.svg" />',
      );
      expect(emojify('🐰')).toEqual(
        '<img draggable="false" class="emojione" alt="🐰" title=":rabbit:" src="/packs/emoji/1f430.svg" />',
      );
      expect(emojify('🐇')).toEqual(
        '<img draggable="false" class="emojione" alt="🐇" title=":rabbit2:" src="/packs/emoji/1f407.svg" />',
      );
      expect(emojify('🐿️')).toEqual(
        '<img draggable="false" class="emojione" alt="🐿️" title=":chipmunk:" src="/packs/emoji/1f43f.svg" />',
      );
      expect(emojify('🦫')).toEqual(
        '<img draggable="false" class="emojione" alt="🦫" title=":beaver:" src="/packs/emoji/1f9ab.svg" />',
      );
      expect(emojify('🦔')).toEqual(
        '<img draggable="false" class="emojione" alt="🦔" title=":hedgehog:" src="/packs/emoji/1f994.svg" />',
      );
      expect(emojify('🦇')).toEqual(
        '<img draggable="false" class="emojione" alt="🦇" title=":bat:" src="/packs/emoji/1f987.svg" />',
      );
      expect(emojify('🐻')).toEqual(
        '<img draggable="false" class="emojione" alt="🐻" title=":bear:" src="/packs/emoji/1f43b.svg" />',
      );
      expect(emojify('🐻‍❄️')).toEqual(
        '<img draggable="false" class="emojione" alt="🐻‍❄️" title=":polar_bear:" src="/packs/emoji/1f43b-200d-2744-fe0f.svg" />',
      );
      expect(emojify('🐨')).toEqual(
        '<img draggable="false" class="emojione" alt="🐨" title=":koala:" src="/packs/emoji/1f428.svg" />',
      );
      expect(emojify('🐼')).toEqual(
        '<img draggable="false" class="emojione" alt="🐼" title=":panda_face:" src="/packs/emoji/1f43c.svg" />',
      );
      expect(emojify('🦥')).toEqual(
        '<img draggable="false" class="emojione" alt="🦥" title=":sloth:" src="/packs/emoji/1f9a5.svg" />',
      );
      expect(emojify('🦦')).toEqual(
        '<img draggable="false" class="emojione" alt="🦦" title=":otter:" src="/packs/emoji/1f9a6.svg" />',
      );
      expect(emojify('🦨')).toEqual(
        '<img draggable="false" class="emojione" alt="🦨" title=":skunk:" src="/packs/emoji/1f9a8.svg" />',
      );
      expect(emojify('🦘')).toEqual(
        '<img draggable="false" class="emojione" alt="🦘" title=":kangaroo:" src="/packs/emoji/1f998.svg" />',
      );
      expect(emojify('🦡')).toEqual(
        '<img draggable="false" class="emojione" alt="🦡" title=":badger:" src="/packs/emoji/1f9a1.svg" />',
      );
      expect(emojify('🐾')).toEqual(
        '<img draggable="false" class="emojione" alt="🐾" title=":feet:" src="/packs/emoji/1f43e.svg" />',
      );
      expect(emojify('🦃')).toEqual(
        '<img draggable="false" class="emojione" alt="🦃" title=":turkey:" src="/packs/emoji/1f983.svg" />',
      );
      expect(emojify('🐔')).toEqual(
        '<img draggable="false" class="emojione" alt="🐔" title=":chicken:" src="/packs/emoji/1f414.svg" />',
      );
      expect(emojify('🐓')).toEqual(
        '<img draggable="false" class="emojione" alt="🐓" title=":rooster:" src="/packs/emoji/1f413.svg" />',
      );
      expect(emojify('🐣')).toEqual(
        '<img draggable="false" class="emojione" alt="🐣" title=":hatching_chick:" src="/packs/emoji/1f423.svg" />',
      );
      expect(emojify('🐤')).toEqual(
        '<img draggable="false" class="emojione" alt="🐤" title=":baby_chick:" src="/packs/emoji/1f424.svg" />',
      );
      expect(emojify('🐥')).toEqual(
        '<img draggable="false" class="emojione" alt="🐥" title=":hatched_chick:" src="/packs/emoji/1f425.svg" />',
      );
      expect(emojify('🐦')).toEqual(
        '<img draggable="false" class="emojione" alt="🐦" title=":bird:" src="/packs/emoji/1f426.svg" />',
      );
      expect(emojify('🐧')).toEqual(
        '<img draggable="false" class="emojione" alt="🐧" title=":penguin:" src="/packs/emoji/1f427.svg" />',
      );
      expect(emojify('🕊️')).toEqual(
        '<img draggable="false" class="emojione" alt="🕊️" title=":dove_of_peace:" src="/packs/emoji/1f54a.svg" />',
      );
      expect(emojify('🦅')).toEqual(
        '<img draggable="false" class="emojione" alt="🦅" title=":eagle:" src="/packs/emoji/1f985.svg" />',
      );
      expect(emojify('🦆')).toEqual(
        '<img draggable="false" class="emojione" alt="🦆" title=":duck:" src="/packs/emoji/1f986.svg" />',
      );
      expect(emojify('🦢')).toEqual(
        '<img draggable="false" class="emojione" alt="🦢" title=":swan:" src="/packs/emoji/1f9a2.svg" />',
      );
      expect(emojify('🦉')).toEqual(
        '<img draggable="false" class="emojione" alt="🦉" title=":owl:" src="/packs/emoji/1f989.svg" />',
      );
      expect(emojify('🦤')).toEqual(
        '<img draggable="false" class="emojione" alt="🦤" title=":dodo:" src="/packs/emoji/1f9a4.svg" />',
      );
      expect(emojify('🪶')).toEqual(
        '<img draggable="false" class="emojione" alt="🪶" title=":feather:" src="/packs/emoji/1fab6.svg" />',
      );
      expect(emojify('🦩')).toEqual(
        '<img draggable="false" class="emojione" alt="🦩" title=":flamingo:" src="/packs/emoji/1f9a9.svg" />',
      );
      expect(emojify('🦚')).toEqual(
        '<img draggable="false" class="emojione" alt="🦚" title=":peacock:" src="/packs/emoji/1f99a.svg" />',
      );
      expect(emojify('🦜')).toEqual(
        '<img draggable="false" class="emojione" alt="🦜" title=":parrot:" src="/packs/emoji/1f99c.svg" />',
      );
      expect(emojify('🐸')).toEqual(
        '<img draggable="false" class="emojione" alt="🐸" title=":frog:" src="/packs/emoji/1f438.svg" />',
      );
      expect(emojify('🐊')).toEqual(
        '<img draggable="false" class="emojione" alt="🐊" title=":crocodile:" src="/packs/emoji/1f40a.svg" />',
      );
      expect(emojify('🐢')).toEqual(
        '<img draggable="false" class="emojione" alt="🐢" title=":turtle:" src="/packs/emoji/1f422.svg" />',
      );
      expect(emojify('🦎')).toEqual(
        '<img draggable="false" class="emojione" alt="🦎" title=":lizard:" src="/packs/emoji/1f98e.svg" />',
      );
      expect(emojify('🐍')).toEqual(
        '<img draggable="false" class="emojione" alt="🐍" title=":snake:" src="/packs/emoji/1f40d.svg" />',
      );
      expect(emojify('🐲')).toEqual(
        '<img draggable="false" class="emojione" alt="🐲" title=":dragon_face:" src="/packs/emoji/1f432.svg" />',
      );
      expect(emojify('🐉')).toEqual(
        '<img draggable="false" class="emojione" alt="🐉" title=":dragon:" src="/packs/emoji/1f409.svg" />',
      );
      expect(emojify('🦕')).toEqual(
        '<img draggable="false" class="emojione" alt="🦕" title=":sauropod:" src="/packs/emoji/1f995.svg" />',
      );
      expect(emojify('🦖')).toEqual(
        '<img draggable="false" class="emojione" alt="🦖" title=":t-rex:" src="/packs/emoji/1f996.svg" />',
      );
      expect(emojify('🐳')).toEqual(
        '<img draggable="false" class="emojione" alt="🐳" title=":whale:" src="/packs/emoji/1f433.svg" />',
      );
      expect(emojify('🐋')).toEqual(
        '<img draggable="false" class="emojione" alt="🐋" title=":whale2:" src="/packs/emoji/1f40b.svg" />',
      );
      expect(emojify('🐬')).toEqual(
        '<img draggable="false" class="emojione" alt="🐬" title=":dolphin:" src="/packs/emoji/1f42c.svg" />',
      );
      expect(emojify('🦭')).toEqual(
        '<img draggable="false" class="emojione" alt="🦭" title=":seal:" src="/packs/emoji/1f9ad.svg" />',
      );
      expect(emojify('🐟')).toEqual(
        '<img draggable="false" class="emojione" alt="🐟" title=":fish:" src="/packs/emoji/1f41f.svg" />',
      );
      expect(emojify('🐠')).toEqual(
        '<img draggable="false" class="emojione" alt="🐠" title=":tropical_fish:" src="/packs/emoji/1f420.svg" />',
      );
      expect(emojify('🐡')).toEqual(
        '<img draggable="false" class="emojione" alt="🐡" title=":blowfish:" src="/packs/emoji/1f421.svg" />',
      );
      expect(emojify('🦈')).toEqual(
        '<img draggable="false" class="emojione" alt="🦈" title=":shark:" src="/packs/emoji/1f988.svg" />',
      );
      expect(emojify('🐙')).toEqual(
        '<img draggable="false" class="emojione" alt="🐙" title=":octopus:" src="/packs/emoji/1f419.svg" />',
      );
      expect(emojify('🐚')).toEqual(
        '<img draggable="false" class="emojione" alt="🐚" title=":shell:" src="/packs/emoji/1f41a.svg" />',
      );
      expect(emojify('🪸')).toEqual(
        '<img draggable="false" class="emojione" alt="🪸" title=":coral:" src="/packs/emoji/1fab8.svg" />',
      );
      expect(emojify('🐌')).toEqual(
        '<img draggable="false" class="emojione" alt="🐌" title=":snail:" src="/packs/emoji/1f40c.svg" />',
      );
      expect(emojify('🦋')).toEqual(
        '<img draggable="false" class="emojione" alt="🦋" title=":butterfly:" src="/packs/emoji/1f98b.svg" />',
      );
      expect(emojify('🐛')).toEqual(
        '<img draggable="false" class="emojione" alt="🐛" title=":bug:" src="/packs/emoji/1f41b.svg" />',
      );
      expect(emojify('🐜')).toEqual(
        '<img draggable="false" class="emojione" alt="🐜" title=":ant:" src="/packs/emoji/1f41c.svg" />',
      );
      expect(emojify('🐝')).toEqual(
        '<img draggable="false" class="emojione" alt="🐝" title=":bee:" src="/packs/emoji/1f41d.svg" />',
      );
      expect(emojify('🪲')).toEqual(
        '<img draggable="false" class="emojione" alt="🪲" title=":beetle:" src="/packs/emoji/1fab2.svg" />',
      );
      expect(emojify('🐞')).toEqual(
        '<img draggable="false" class="emojione" alt="🐞" title=":ladybug:" src="/packs/emoji/1f41e.svg" />',
      );
      expect(emojify('🦗')).toEqual(
        '<img draggable="false" class="emojione" alt="🦗" title=":cricket:" src="/packs/emoji/1f997.svg" />',
      );
      expect(emojify('🪳')).toEqual(
        '<img draggable="false" class="emojione" alt="🪳" title=":cockroach:" src="/packs/emoji/1fab3.svg" />',
      );
      expect(emojify('🕷️')).toEqual(
        '<img draggable="false" class="emojione" alt="🕷️" title=":spider:" src="/packs/emoji/1f577.svg" />',
      );
      expect(emojify('🕸️')).toEqual(
        '<img draggable="false" class="emojione" alt="🕸️" title=":spider_web:" src="/packs/emoji/1f578.svg" />',
      );
      expect(emojify('🦂')).toEqual(
        '<img draggable="false" class="emojione" alt="🦂" title=":scorpion:" src="/packs/emoji/1f982.svg" />',
      );
      expect(emojify('🦟')).toEqual(
        '<img draggable="false" class="emojione" alt="🦟" title=":mosquito:" src="/packs/emoji/1f99f.svg" />',
      );
      expect(emojify('🪰')).toEqual(
        '<img draggable="false" class="emojione" alt="🪰" title=":fly:" src="/packs/emoji/1fab0.svg" />',
      );
      expect(emojify('🪱')).toEqual(
        '<img draggable="false" class="emojione" alt="🪱" title=":worm:" src="/packs/emoji/1fab1.svg" />',
      );
      expect(emojify('🦠')).toEqual(
        '<img draggable="false" class="emojione" alt="🦠" title=":microbe:" src="/packs/emoji/1f9a0.svg" />',
      );
      expect(emojify('💐')).toEqual(
        '<img draggable="false" class="emojione" alt="💐" title=":bouquet:" src="/packs/emoji/1f490.svg" />',
      );
      expect(emojify('🌸')).toEqual(
        '<img draggable="false" class="emojione" alt="🌸" title=":cherry_blossom:" src="/packs/emoji/1f338.svg" />',
      );
      expect(emojify('💮')).toEqual(
        '<img draggable="false" class="emojione" alt="💮" title=":white_flower:" src="/packs/emoji/1f4ae.svg" />',
      );
      expect(emojify('🪷')).toEqual(
        '<img draggable="false" class="emojione" alt="🪷" title=":lotus:" src="/packs/emoji/1fab7.svg" />',
      );
      expect(emojify('🏵️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏵️" title=":rosette:" src="/packs/emoji/1f3f5.svg" />',
      );
      expect(emojify('🌹')).toEqual(
        '<img draggable="false" class="emojione" alt="🌹" title=":rose:" src="/packs/emoji/1f339.svg" />',
      );
      expect(emojify('🥀')).toEqual(
        '<img draggable="false" class="emojione" alt="🥀" title=":wilted_flower:" src="/packs/emoji/1f940.svg" />',
      );
      expect(emojify('🌺')).toEqual(
        '<img draggable="false" class="emojione" alt="🌺" title=":hibiscus:" src="/packs/emoji/1f33a.svg" />',
      );
      expect(emojify('🌻')).toEqual(
        '<img draggable="false" class="emojione" alt="🌻" title=":sunflower:" src="/packs/emoji/1f33b.svg" />',
      );
      expect(emojify('🌼')).toEqual(
        '<img draggable="false" class="emojione" alt="🌼" title=":blossom:" src="/packs/emoji/1f33c.svg" />',
      );
      expect(emojify('🌷')).toEqual(
        '<img draggable="false" class="emojione" alt="🌷" title=":tulip:" src="/packs/emoji/1f337.svg" />',
      );
      expect(emojify('🌱')).toEqual(
        '<img draggable="false" class="emojione" alt="🌱" title=":seedling:" src="/packs/emoji/1f331.svg" />',
      );
      expect(emojify('🪴')).toEqual(
        '<img draggable="false" class="emojione" alt="🪴" title=":potted_plant:" src="/packs/emoji/1fab4.svg" />',
      );
      expect(emojify('🌲')).toEqual(
        '<img draggable="false" class="emojione" alt="🌲" title=":evergreen_tree:" src="/packs/emoji/1f332.svg" />',
      );
      expect(emojify('🌳')).toEqual(
        '<img draggable="false" class="emojione" alt="🌳" title=":deciduous_tree:" src="/packs/emoji/1f333.svg" />',
      );
      expect(emojify('🌴')).toEqual(
        '<img draggable="false" class="emojione" alt="🌴" title=":palm_tree:" src="/packs/emoji/1f334.svg" />',
      );
      expect(emojify('🌵')).toEqual(
        '<img draggable="false" class="emojione" alt="🌵" title=":cactus:" src="/packs/emoji/1f335.svg" />',
      );
      expect(emojify('🌾')).toEqual(
        '<img draggable="false" class="emojione" alt="🌾" title=":ear_of_rice:" src="/packs/emoji/1f33e.svg" />',
      );
      expect(emojify('🌿')).toEqual(
        '<img draggable="false" class="emojione" alt="🌿" title=":herb:" src="/packs/emoji/1f33f.svg" />',
      );
      expect(emojify('☘️')).toEqual(
        '<img draggable="false" class="emojione" alt="☘️" title=":shamrock:" src="/packs/emoji/2618.svg" />',
      );
      expect(emojify('🍀')).toEqual(
        '<img draggable="false" class="emojione" alt="🍀" title=":four_leaf_clover:" src="/packs/emoji/1f340.svg" />',
      );
      expect(emojify('🍁')).toEqual(
        '<img draggable="false" class="emojione" alt="🍁" title=":maple_leaf:" src="/packs/emoji/1f341.svg" />',
      );
      expect(emojify('🍂')).toEqual(
        '<img draggable="false" class="emojione" alt="🍂" title=":fallen_leaf:" src="/packs/emoji/1f342.svg" />',
      );
      expect(emojify('🍃')).toEqual(
        '<img draggable="false" class="emojione" alt="🍃" title=":leaves:" src="/packs/emoji/1f343.svg" />',
      );
      expect(emojify('🪹')).toEqual(
        '<img draggable="false" class="emojione" alt="🪹" title=":empty_nest:" src="/packs/emoji/1fab9.svg" />',
      );
      expect(emojify('🪺')).toEqual(
        '<img draggable="false" class="emojione" alt="🪺" title=":nest_with_eggs:" src="/packs/emoji/1faba.svg" />',
      );
      expect(emojify('🍇')).toEqual(
        '<img draggable="false" class="emojione" alt="🍇" title=":grapes:" src="/packs/emoji/1f347.svg" />',
      );
      expect(emojify('🍈')).toEqual(
        '<img draggable="false" class="emojione" alt="🍈" title=":melon:" src="/packs/emoji/1f348.svg" />',
      );
      expect(emojify('🍉')).toEqual(
        '<img draggable="false" class="emojione" alt="🍉" title=":watermelon:" src="/packs/emoji/1f349.svg" />',
      );
      expect(emojify('🍊')).toEqual(
        '<img draggable="false" class="emojione" alt="🍊" title=":tangerine:" src="/packs/emoji/1f34a.svg" />',
      );
      expect(emojify('🍋')).toEqual(
        '<img draggable="false" class="emojione" alt="🍋" title=":lemon:" src="/packs/emoji/1f34b.svg" />',
      );
      expect(emojify('🍌')).toEqual(
        '<img draggable="false" class="emojione" alt="🍌" title=":banana:" src="/packs/emoji/1f34c.svg" />',
      );
      expect(emojify('🍍')).toEqual(
        '<img draggable="false" class="emojione" alt="🍍" title=":pineapple:" src="/packs/emoji/1f34d.svg" />',
      );
      expect(emojify('🥭')).toEqual(
        '<img draggable="false" class="emojione" alt="🥭" title=":mango:" src="/packs/emoji/1f96d.svg" />',
      );
      expect(emojify('🍎')).toEqual(
        '<img draggable="false" class="emojione" alt="🍎" title=":apple:" src="/packs/emoji/1f34e.svg" />',
      );
      expect(emojify('🍏')).toEqual(
        '<img draggable="false" class="emojione" alt="🍏" title=":green_apple:" src="/packs/emoji/1f34f.svg" />',
      );
      expect(emojify('🍐')).toEqual(
        '<img draggable="false" class="emojione" alt="🍐" title=":pear:" src="/packs/emoji/1f350.svg" />',
      );
      expect(emojify('🍑')).toEqual(
        '<img draggable="false" class="emojione" alt="🍑" title=":peach:" src="/packs/emoji/1f351.svg" />',
      );
      expect(emojify('🍒')).toEqual(
        '<img draggable="false" class="emojione" alt="🍒" title=":cherries:" src="/packs/emoji/1f352.svg" />',
      );
      expect(emojify('🍓')).toEqual(
        '<img draggable="false" class="emojione" alt="🍓" title=":strawberry:" src="/packs/emoji/1f353.svg" />',
      );
      expect(emojify('🫐')).toEqual(
        '<img draggable="false" class="emojione" alt="🫐" title=":blueberries:" src="/packs/emoji/1fad0.svg" />',
      );
      expect(emojify('🥝')).toEqual(
        '<img draggable="false" class="emojione" alt="🥝" title=":kiwifruit:" src="/packs/emoji/1f95d.svg" />',
      );
      expect(emojify('🍅')).toEqual(
        '<img draggable="false" class="emojione" alt="🍅" title=":tomato:" src="/packs/emoji/1f345.svg" />',
      );
      expect(emojify('🫒')).toEqual(
        '<img draggable="false" class="emojione" alt="🫒" title=":olive:" src="/packs/emoji/1fad2.svg" />',
      );
      expect(emojify('🥥')).toEqual(
        '<img draggable="false" class="emojione" alt="🥥" title=":coconut:" src="/packs/emoji/1f965.svg" />',
      );
      expect(emojify('🥑')).toEqual(
        '<img draggable="false" class="emojione" alt="🥑" title=":avocado:" src="/packs/emoji/1f951.svg" />',
      );
      expect(emojify('🍆')).toEqual(
        '<img draggable="false" class="emojione" alt="🍆" title=":eggplant:" src="/packs/emoji/1f346.svg" />',
      );
      expect(emojify('🥔')).toEqual(
        '<img draggable="false" class="emojione" alt="🥔" title=":potato:" src="/packs/emoji/1f954.svg" />',
      );
      expect(emojify('🥕')).toEqual(
        '<img draggable="false" class="emojione" alt="🥕" title=":carrot:" src="/packs/emoji/1f955.svg" />',
      );
      expect(emojify('🌽')).toEqual(
        '<img draggable="false" class="emojione" alt="🌽" title=":corn:" src="/packs/emoji/1f33d.svg" />',
      );
      expect(emojify('🌶️')).toEqual(
        '<img draggable="false" class="emojione" alt="🌶️" title=":hot_pepper:" src="/packs/emoji/1f336.svg" />',
      );
      expect(emojify('🫑')).toEqual(
        '<img draggable="false" class="emojione" alt="🫑" title=":bell_pepper:" src="/packs/emoji/1fad1.svg" />',
      );
      expect(emojify('🥒')).toEqual(
        '<img draggable="false" class="emojione" alt="🥒" title=":cucumber:" src="/packs/emoji/1f952.svg" />',
      );
      expect(emojify('🥬')).toEqual(
        '<img draggable="false" class="emojione" alt="🥬" title=":leafy_green:" src="/packs/emoji/1f96c.svg" />',
      );
      expect(emojify('🥦')).toEqual(
        '<img draggable="false" class="emojione" alt="🥦" title=":broccoli:" src="/packs/emoji/1f966.svg" />',
      );
      expect(emojify('🧄')).toEqual(
        '<img draggable="false" class="emojione" alt="🧄" title=":garlic:" src="/packs/emoji/1f9c4.svg" />',
      );
      expect(emojify('🧅')).toEqual(
        '<img draggable="false" class="emojione" alt="🧅" title=":onion:" src="/packs/emoji/1f9c5.svg" />',
      );
      expect(emojify('🍄')).toEqual(
        '<img draggable="false" class="emojione" alt="🍄" title=":mushroom:" src="/packs/emoji/1f344.svg" />',
      );
      expect(emojify('🥜')).toEqual(
        '<img draggable="false" class="emojione" alt="🥜" title=":peanuts:" src="/packs/emoji/1f95c.svg" />',
      );
      expect(emojify('🫘')).toEqual(
        '<img draggable="false" class="emojione" alt="🫘" title=":beans:" src="/packs/emoji/1fad8.svg" />',
      );
      expect(emojify('🌰')).toEqual(
        '<img draggable="false" class="emojione" alt="🌰" title=":chestnut:" src="/packs/emoji/1f330.svg" />',
      );
      expect(emojify('🍞')).toEqual(
        '<img draggable="false" class="emojione" alt="🍞" title=":bread:" src="/packs/emoji/1f35e.svg" />',
      );
      expect(emojify('🥐')).toEqual(
        '<img draggable="false" class="emojione" alt="🥐" title=":croissant:" src="/packs/emoji/1f950.svg" />',
      );
      expect(emojify('🥖')).toEqual(
        '<img draggable="false" class="emojione" alt="🥖" title=":baguette_bread:" src="/packs/emoji/1f956.svg" />',
      );
      expect(emojify('🫓')).toEqual(
        '<img draggable="false" class="emojione" alt="🫓" title=":flatbread:" src="/packs/emoji/1fad3.svg" />',
      );
      expect(emojify('🥨')).toEqual(
        '<img draggable="false" class="emojione" alt="🥨" title=":pretzel:" src="/packs/emoji/1f968.svg" />',
      );
      expect(emojify('🥯')).toEqual(
        '<img draggable="false" class="emojione" alt="🥯" title=":bagel:" src="/packs/emoji/1f96f.svg" />',
      );
      expect(emojify('🥞')).toEqual(
        '<img draggable="false" class="emojione" alt="🥞" title=":pancakes:" src="/packs/emoji/1f95e.svg" />',
      );
      expect(emojify('🧇')).toEqual(
        '<img draggable="false" class="emojione" alt="🧇" title=":waffle:" src="/packs/emoji/1f9c7.svg" />',
      );
      expect(emojify('🧀')).toEqual(
        '<img draggable="false" class="emojione" alt="🧀" title=":cheese_wedge:" src="/packs/emoji/1f9c0.svg" />',
      );
      expect(emojify('🍖')).toEqual(
        '<img draggable="false" class="emojione" alt="🍖" title=":meat_on_bone:" src="/packs/emoji/1f356.svg" />',
      );
      expect(emojify('🍗')).toEqual(
        '<img draggable="false" class="emojione" alt="🍗" title=":poultry_leg:" src="/packs/emoji/1f357.svg" />',
      );
      expect(emojify('🥩')).toEqual(
        '<img draggable="false" class="emojione" alt="🥩" title=":cut_of_meat:" src="/packs/emoji/1f969.svg" />',
      );
      expect(emojify('🥓')).toEqual(
        '<img draggable="false" class="emojione" alt="🥓" title=":bacon:" src="/packs/emoji/1f953.svg" />',
      );
      expect(emojify('🍔')).toEqual(
        '<img draggable="false" class="emojione" alt="🍔" title=":hamburger:" src="/packs/emoji/1f354.svg" />',
      );
      expect(emojify('🍟')).toEqual(
        '<img draggable="false" class="emojione" alt="🍟" title=":fries:" src="/packs/emoji/1f35f.svg" />',
      );
      expect(emojify('🍕')).toEqual(
        '<img draggable="false" class="emojione" alt="🍕" title=":pizza:" src="/packs/emoji/1f355.svg" />',
      );
      expect(emojify('🌭')).toEqual(
        '<img draggable="false" class="emojione" alt="🌭" title=":hotdog:" src="/packs/emoji/1f32d.svg" />',
      );
      expect(emojify('🥪')).toEqual(
        '<img draggable="false" class="emojione" alt="🥪" title=":sandwich:" src="/packs/emoji/1f96a.svg" />',
      );
      expect(emojify('🌮')).toEqual(
        '<img draggable="false" class="emojione" alt="🌮" title=":taco:" src="/packs/emoji/1f32e.svg" />',
      );
      expect(emojify('🌯')).toEqual(
        '<img draggable="false" class="emojione" alt="🌯" title=":burrito:" src="/packs/emoji/1f32f.svg" />',
      );
      expect(emojify('🫔')).toEqual(
        '<img draggable="false" class="emojione" alt="🫔" title=":tamale:" src="/packs/emoji/1fad4.svg" />',
      );
      expect(emojify('🥙')).toEqual(
        '<img draggable="false" class="emojione" alt="🥙" title=":stuffed_flatbread:" src="/packs/emoji/1f959.svg" />',
      );
      expect(emojify('🧆')).toEqual(
        '<img draggable="false" class="emojione" alt="🧆" title=":falafel:" src="/packs/emoji/1f9c6.svg" />',
      );
      expect(emojify('🥚')).toEqual(
        '<img draggable="false" class="emojione" alt="🥚" title=":egg:" src="/packs/emoji/1f95a.svg" />',
      );
      expect(emojify('🍳')).toEqual(
        '<img draggable="false" class="emojione" alt="🍳" title=":fried_egg:" src="/packs/emoji/1f373.svg" />',
      );
      expect(emojify('🥘')).toEqual(
        '<img draggable="false" class="emojione" alt="🥘" title=":shallow_pan_of_food:" src="/packs/emoji/1f958.svg" />',
      );
      expect(emojify('🍲')).toEqual(
        '<img draggable="false" class="emojione" alt="🍲" title=":stew:" src="/packs/emoji/1f372.svg" />',
      );
      expect(emojify('🫕')).toEqual(
        '<img draggable="false" class="emojione" alt="🫕" title=":fondue:" src="/packs/emoji/1fad5.svg" />',
      );
      expect(emojify('🥣')).toEqual(
        '<img draggable="false" class="emojione" alt="🥣" title=":bowl_with_spoon:" src="/packs/emoji/1f963.svg" />',
      );
      expect(emojify('🥗')).toEqual(
        '<img draggable="false" class="emojione" alt="🥗" title=":green_salad:" src="/packs/emoji/1f957.svg" />',
      );
      expect(emojify('🍿')).toEqual(
        '<img draggable="false" class="emojione" alt="🍿" title=":popcorn:" src="/packs/emoji/1f37f.svg" />',
      );
      expect(emojify('🧈')).toEqual(
        '<img draggable="false" class="emojione" alt="🧈" title=":butter:" src="/packs/emoji/1f9c8.svg" />',
      );
      expect(emojify('🧂')).toEqual(
        '<img draggable="false" class="emojione" alt="🧂" title=":salt:" src="/packs/emoji/1f9c2.svg" />',
      );
      expect(emojify('🥫')).toEqual(
        '<img draggable="false" class="emojione" alt="🥫" title=":canned_food:" src="/packs/emoji/1f96b.svg" />',
      );
      expect(emojify('🍱')).toEqual(
        '<img draggable="false" class="emojione" alt="🍱" title=":bento:" src="/packs/emoji/1f371.svg" />',
      );
      expect(emojify('🍘')).toEqual(
        '<img draggable="false" class="emojione" alt="🍘" title=":rice_cracker:" src="/packs/emoji/1f358.svg" />',
      );
      expect(emojify('🍙')).toEqual(
        '<img draggable="false" class="emojione" alt="🍙" title=":rice_ball:" src="/packs/emoji/1f359.svg" />',
      );
      expect(emojify('🍚')).toEqual(
        '<img draggable="false" class="emojione" alt="🍚" title=":rice:" src="/packs/emoji/1f35a.svg" />',
      );
      expect(emojify('🍛')).toEqual(
        '<img draggable="false" class="emojione" alt="🍛" title=":curry:" src="/packs/emoji/1f35b.svg" />',
      );
      expect(emojify('🍜')).toEqual(
        '<img draggable="false" class="emojione" alt="🍜" title=":ramen:" src="/packs/emoji/1f35c.svg" />',
      );
      expect(emojify('🍝')).toEqual(
        '<img draggable="false" class="emojione" alt="🍝" title=":spaghetti:" src="/packs/emoji/1f35d.svg" />',
      );
      expect(emojify('🍠')).toEqual(
        '<img draggable="false" class="emojione" alt="🍠" title=":sweet_potato:" src="/packs/emoji/1f360.svg" />',
      );
      expect(emojify('🍢')).toEqual(
        '<img draggable="false" class="emojione" alt="🍢" title=":oden:" src="/packs/emoji/1f362.svg" />',
      );
      expect(emojify('🍣')).toEqual(
        '<img draggable="false" class="emojione" alt="🍣" title=":sushi:" src="/packs/emoji/1f363.svg" />',
      );
      expect(emojify('🍤')).toEqual(
        '<img draggable="false" class="emojione" alt="🍤" title=":fried_shrimp:" src="/packs/emoji/1f364.svg" />',
      );
      expect(emojify('🍥')).toEqual(
        '<img draggable="false" class="emojione" alt="🍥" title=":fish_cake:" src="/packs/emoji/1f365.svg" />',
      );
      expect(emojify('🥮')).toEqual(
        '<img draggable="false" class="emojione" alt="🥮" title=":moon_cake:" src="/packs/emoji/1f96e.svg" />',
      );
      expect(emojify('🍡')).toEqual(
        '<img draggable="false" class="emojione" alt="🍡" title=":dango:" src="/packs/emoji/1f361.svg" />',
      );
      expect(emojify('🥟')).toEqual(
        '<img draggable="false" class="emojione" alt="🥟" title=":dumpling:" src="/packs/emoji/1f95f.svg" />',
      );
      expect(emojify('🥠')).toEqual(
        '<img draggable="false" class="emojione" alt="🥠" title=":fortune_cookie:" src="/packs/emoji/1f960.svg" />',
      );
      expect(emojify('🥡')).toEqual(
        '<img draggable="false" class="emojione" alt="🥡" title=":takeout_box:" src="/packs/emoji/1f961.svg" />',
      );
      expect(emojify('🦀')).toEqual(
        '<img draggable="false" class="emojione" alt="🦀" title=":crab:" src="/packs/emoji/1f980.svg" />',
      );
      expect(emojify('🦞')).toEqual(
        '<img draggable="false" class="emojione" alt="🦞" title=":lobster:" src="/packs/emoji/1f99e.svg" />',
      );
      expect(emojify('🦐')).toEqual(
        '<img draggable="false" class="emojione" alt="🦐" title=":shrimp:" src="/packs/emoji/1f990.svg" />',
      );
      expect(emojify('🦑')).toEqual(
        '<img draggable="false" class="emojione" alt="🦑" title=":squid:" src="/packs/emoji/1f991.svg" />',
      );
      expect(emojify('🦪')).toEqual(
        '<img draggable="false" class="emojione" alt="🦪" title=":oyster:" src="/packs/emoji/1f9aa.svg" />',
      );
      expect(emojify('🍦')).toEqual(
        '<img draggable="false" class="emojione" alt="🍦" title=":icecream:" src="/packs/emoji/1f366.svg" />',
      );
      expect(emojify('🍧')).toEqual(
        '<img draggable="false" class="emojione" alt="🍧" title=":shaved_ice:" src="/packs/emoji/1f367.svg" />',
      );
      expect(emojify('🍨')).toEqual(
        '<img draggable="false" class="emojione" alt="🍨" title=":ice_cream:" src="/packs/emoji/1f368.svg" />',
      );
      expect(emojify('🍩')).toEqual(
        '<img draggable="false" class="emojione" alt="🍩" title=":doughnut:" src="/packs/emoji/1f369.svg" />',
      );
      expect(emojify('🍪')).toEqual(
        '<img draggable="false" class="emojione" alt="🍪" title=":cookie:" src="/packs/emoji/1f36a.svg" />',
      );
      expect(emojify('🎂')).toEqual(
        '<img draggable="false" class="emojione" alt="🎂" title=":birthday:" src="/packs/emoji/1f382.svg" />',
      );
      expect(emojify('🍰')).toEqual(
        '<img draggable="false" class="emojione" alt="🍰" title=":cake:" src="/packs/emoji/1f370.svg" />',
      );
      expect(emojify('🧁')).toEqual(
        '<img draggable="false" class="emojione" alt="🧁" title=":cupcake:" src="/packs/emoji/1f9c1.svg" />',
      );
      expect(emojify('🥧')).toEqual(
        '<img draggable="false" class="emojione" alt="🥧" title=":pie:" src="/packs/emoji/1f967.svg" />',
      );
      expect(emojify('🍫')).toEqual(
        '<img draggable="false" class="emojione" alt="🍫" title=":chocolate_bar:" src="/packs/emoji/1f36b.svg" />',
      );
      expect(emojify('🍬')).toEqual(
        '<img draggable="false" class="emojione" alt="🍬" title=":candy:" src="/packs/emoji/1f36c.svg" />',
      );
      expect(emojify('🍭')).toEqual(
        '<img draggable="false" class="emojione" alt="🍭" title=":lollipop:" src="/packs/emoji/1f36d.svg" />',
      );
      expect(emojify('🍮')).toEqual(
        '<img draggable="false" class="emojione" alt="🍮" title=":custard:" src="/packs/emoji/1f36e.svg" />',
      );
      expect(emojify('🍯')).toEqual(
        '<img draggable="false" class="emojione" alt="🍯" title=":honey_pot:" src="/packs/emoji/1f36f.svg" />',
      );
      expect(emojify('🍼')).toEqual(
        '<img draggable="false" class="emojione" alt="🍼" title=":baby_bottle:" src="/packs/emoji/1f37c.svg" />',
      );
      expect(emojify('🥛')).toEqual(
        '<img draggable="false" class="emojione" alt="🥛" title=":glass_of_milk:" src="/packs/emoji/1f95b.svg" />',
      );
      expect(emojify('☕')).toEqual(
        '<img draggable="false" class="emojione" alt="☕" title=":coffee:" src="/packs/emoji/2615.svg" />',
      );
      expect(emojify('🫖')).toEqual(
        '<img draggable="false" class="emojione" alt="🫖" title=":teapot:" src="/packs/emoji/1fad6.svg" />',
      );
      expect(emojify('🍵')).toEqual(
        '<img draggable="false" class="emojione" alt="🍵" title=":tea:" src="/packs/emoji/1f375.svg" />',
      );
      expect(emojify('🍶')).toEqual(
        '<img draggable="false" class="emojione" alt="🍶" title=":sake:" src="/packs/emoji/1f376.svg" />',
      );
      expect(emojify('🍾')).toEqual(
        '<img draggable="false" class="emojione" alt="🍾" title=":champagne:" src="/packs/emoji/1f37e.svg" />',
      );
      expect(emojify('🍷')).toEqual(
        '<img draggable="false" class="emojione" alt="🍷" title=":wine_glass:" src="/packs/emoji/1f377.svg" />',
      );
      expect(emojify('🍸')).toEqual(
        '<img draggable="false" class="emojione" alt="🍸" title=":cocktail:" src="/packs/emoji/1f378.svg" />',
      );
      expect(emojify('🍹')).toEqual(
        '<img draggable="false" class="emojione" alt="🍹" title=":tropical_drink:" src="/packs/emoji/1f379.svg" />',
      );
      expect(emojify('🍺')).toEqual(
        '<img draggable="false" class="emojione" alt="🍺" title=":beer:" src="/packs/emoji/1f37a.svg" />',
      );
      expect(emojify('🍻')).toEqual(
        '<img draggable="false" class="emojione" alt="🍻" title=":beers:" src="/packs/emoji/1f37b.svg" />',
      );
      expect(emojify('🥂')).toEqual(
        '<img draggable="false" class="emojione" alt="🥂" title=":clinking_glasses:" src="/packs/emoji/1f942.svg" />',
      );
      expect(emojify('🥃')).toEqual(
        '<img draggable="false" class="emojione" alt="🥃" title=":tumbler_glass:" src="/packs/emoji/1f943.svg" />',
      );
      expect(emojify('🫗')).toEqual(
        '<img draggable="false" class="emojione" alt="🫗" title=":pouring_liquid:" src="/packs/emoji/1fad7.svg" />',
      );
      expect(emojify('🥤')).toEqual(
        '<img draggable="false" class="emojione" alt="🥤" title=":cup_with_straw:" src="/packs/emoji/1f964.svg" />',
      );
      expect(emojify('🧋')).toEqual(
        '<img draggable="false" class="emojione" alt="🧋" title=":bubble_tea:" src="/packs/emoji/1f9cb.svg" />',
      );
      expect(emojify('🧃')).toEqual(
        '<img draggable="false" class="emojione" alt="🧃" title=":beverage_box:" src="/packs/emoji/1f9c3.svg" />',
      );
      expect(emojify('🧉')).toEqual(
        '<img draggable="false" class="emojione" alt="🧉" title=":mate_drink:" src="/packs/emoji/1f9c9.svg" />',
      );
      expect(emojify('🧊')).toEqual(
        '<img draggable="false" class="emojione" alt="🧊" title=":ice_cube:" src="/packs/emoji/1f9ca.svg" />',
      );
      expect(emojify('🥢')).toEqual(
        '<img draggable="false" class="emojione" alt="🥢" title=":chopsticks:" src="/packs/emoji/1f962.svg" />',
      );
      expect(emojify('🍽️')).toEqual(
        '<img draggable="false" class="emojione" alt="🍽️" title=":knife_fork_plate:" src="/packs/emoji/1f37d.svg" />',
      );
      expect(emojify('🍴')).toEqual(
        '<img draggable="false" class="emojione" alt="🍴" title=":fork_and_knife:" src="/packs/emoji/1f374.svg" />',
      );
      expect(emojify('🥄')).toEqual(
        '<img draggable="false" class="emojione" alt="🥄" title=":spoon:" src="/packs/emoji/1f944.svg" />',
      );
      expect(emojify('🔪')).toEqual(
        '<img draggable="false" class="emojione" alt="🔪" title=":hocho:" src="/packs/emoji/1f52a.svg" />',
      );
      expect(emojify('🫙')).toEqual(
        '<img draggable="false" class="emojione" alt="🫙" title=":jar:" src="/packs/emoji/1fad9.svg" />',
      );
      expect(emojify('🏺')).toEqual(
        '<img draggable="false" class="emojione" alt="🏺" title=":amphora:" src="/packs/emoji/1f3fa.svg" />',
      );
      expect(emojify('🌍')).toEqual(
        '<img draggable="false" class="emojione" alt="🌍" title=":earth_africa:" src="/packs/emoji/1f30d.svg" />',
      );
      expect(emojify('🌎')).toEqual(
        '<img draggable="false" class="emojione" alt="🌎" title=":earth_americas:" src="/packs/emoji/1f30e.svg" />',
      );
      expect(emojify('🌏')).toEqual(
        '<img draggable="false" class="emojione" alt="🌏" title=":earth_asia:" src="/packs/emoji/1f30f.svg" />',
      );
      expect(emojify('🌐')).toEqual(
        '<img draggable="false" class="emojione" alt="🌐" title=":globe_with_meridians:" src="/packs/emoji/1f310.svg" />',
      );
      expect(emojify('🗺️')).toEqual(
        '<img draggable="false" class="emojione" alt="🗺️" title=":world_map:" src="/packs/emoji/1f5fa.svg" />',
      );
      expect(emojify('🗾')).toEqual(
        '<img draggable="false" class="emojione" alt="🗾" title=":japan:" src="/packs/emoji/1f5fe.svg" />',
      );
      expect(emojify('🧭')).toEqual(
        '<img draggable="false" class="emojione" alt="🧭" title=":compass:" src="/packs/emoji/1f9ed.svg" />',
      );
      expect(emojify('🏔️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏔️" title=":snow_capped_mountain:" src="/packs/emoji/1f3d4.svg" />',
      );
      expect(emojify('⛰️')).toEqual(
        '<img draggable="false" class="emojione" alt="⛰️" title=":mountain:" src="/packs/emoji/26f0.svg" />',
      );
      expect(emojify('🌋')).toEqual(
        '<img draggable="false" class="emojione" alt="🌋" title=":volcano:" src="/packs/emoji/1f30b.svg" />',
      );
      expect(emojify('🗻')).toEqual(
        '<img draggable="false" class="emojione" alt="🗻" title=":mount_fuji:" src="/packs/emoji/1f5fb.svg" />',
      );
      expect(emojify('🏕️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏕️" title=":camping:" src="/packs/emoji/1f3d5.svg" />',
      );
      expect(emojify('🏖️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏖️" title=":beach_with_umbrella:" src="/packs/emoji/1f3d6.svg" />',
      );
      expect(emojify('🏜️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏜️" title=":desert:" src="/packs/emoji/1f3dc.svg" />',
      );
      expect(emojify('🏝️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏝️" title=":desert_island:" src="/packs/emoji/1f3dd.svg" />',
      );
      expect(emojify('🏞️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏞️" title=":national_park:" src="/packs/emoji/1f3de.svg" />',
      );
      expect(emojify('🏟️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏟️" title=":stadium:" src="/packs/emoji/1f3df.svg" />',
      );
      expect(emojify('🏛️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏛️" title=":classical_building:" src="/packs/emoji/1f3db.svg" />',
      );
      expect(emojify('🏗️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏗️" title=":building_construction:" src="/packs/emoji/1f3d7.svg" />',
      );
      expect(emojify('🧱')).toEqual(
        '<img draggable="false" class="emojione" alt="🧱" title=":bricks:" src="/packs/emoji/1f9f1.svg" />',
      );
      expect(emojify('🪨')).toEqual(
        '<img draggable="false" class="emojione" alt="🪨" title=":rock:" src="/packs/emoji/1faa8.svg" />',
      );
      expect(emojify('🪵')).toEqual(
        '<img draggable="false" class="emojione" alt="🪵" title=":wood:" src="/packs/emoji/1fab5.svg" />',
      );
      expect(emojify('🛖')).toEqual(
        '<img draggable="false" class="emojione" alt="🛖" title=":hut:" src="/packs/emoji/1f6d6.svg" />',
      );
      expect(emojify('🏘️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏘️" title=":house_buildings:" src="/packs/emoji/1f3d8.svg" />',
      );
      expect(emojify('🏚️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏚️" title=":derelict_house_building:" src="/packs/emoji/1f3da.svg" />',
      );
      expect(emojify('🏠')).toEqual(
        '<img draggable="false" class="emojione" alt="🏠" title=":house:" src="/packs/emoji/1f3e0.svg" />',
      );
      expect(emojify('🏡')).toEqual(
        '<img draggable="false" class="emojione" alt="🏡" title=":house_with_garden:" src="/packs/emoji/1f3e1.svg" />',
      );
      expect(emojify('🏢')).toEqual(
        '<img draggable="false" class="emojione" alt="🏢" title=":office:" src="/packs/emoji/1f3e2.svg" />',
      );
      expect(emojify('🏣')).toEqual(
        '<img draggable="false" class="emojione" alt="🏣" title=":post_office:" src="/packs/emoji/1f3e3.svg" />',
      );
      expect(emojify('🏤')).toEqual(
        '<img draggable="false" class="emojione" alt="🏤" title=":european_post_office:" src="/packs/emoji/1f3e4.svg" />',
      );
      expect(emojify('🏥')).toEqual(
        '<img draggable="false" class="emojione" alt="🏥" title=":hospital:" src="/packs/emoji/1f3e5.svg" />',
      );
      expect(emojify('🏦')).toEqual(
        '<img draggable="false" class="emojione" alt="🏦" title=":bank:" src="/packs/emoji/1f3e6.svg" />',
      );
      expect(emojify('🏨')).toEqual(
        '<img draggable="false" class="emojione" alt="🏨" title=":hotel:" src="/packs/emoji/1f3e8.svg" />',
      );
      expect(emojify('🏩')).toEqual(
        '<img draggable="false" class="emojione" alt="🏩" title=":love_hotel:" src="/packs/emoji/1f3e9.svg" />',
      );
      expect(emojify('🏪')).toEqual(
        '<img draggable="false" class="emojione" alt="🏪" title=":convenience_store:" src="/packs/emoji/1f3ea.svg" />',
      );
      expect(emojify('🏫')).toEqual(
        '<img draggable="false" class="emojione" alt="🏫" title=":school:" src="/packs/emoji/1f3eb.svg" />',
      );
      expect(emojify('🏬')).toEqual(
        '<img draggable="false" class="emojione" alt="🏬" title=":department_store:" src="/packs/emoji/1f3ec.svg" />',
      );
      expect(emojify('🏭')).toEqual(
        '<img draggable="false" class="emojione" alt="🏭" title=":factory:" src="/packs/emoji/1f3ed.svg" />',
      );
      expect(emojify('🏯')).toEqual(
        '<img draggable="false" class="emojione" alt="🏯" title=":japanese_castle:" src="/packs/emoji/1f3ef.svg" />',
      );
      expect(emojify('🏰')).toEqual(
        '<img draggable="false" class="emojione" alt="🏰" title=":european_castle:" src="/packs/emoji/1f3f0.svg" />',
      );
      expect(emojify('💒')).toEqual(
        '<img draggable="false" class="emojione" alt="💒" title=":wedding:" src="/packs/emoji/1f492.svg" />',
      );
      expect(emojify('🗼')).toEqual(
        '<img draggable="false" class="emojione" alt="🗼" title=":tokyo_tower:" src="/packs/emoji/1f5fc.svg" />',
      );
      expect(emojify('🗽')).toEqual(
        '<img draggable="false" class="emojione" alt="🗽" title=":statue_of_liberty:" src="/packs/emoji/1f5fd.svg" />',
      );
      expect(emojify('⛪')).toEqual(
        '<img draggable="false" class="emojione" alt="⛪" title=":church:" src="/packs/emoji/26ea.svg" />',
      );
      expect(emojify('🕌')).toEqual(
        '<img draggable="false" class="emojione" alt="🕌" title=":mosque:" src="/packs/emoji/1f54c.svg" />',
      );
      expect(emojify('🛕')).toEqual(
        '<img draggable="false" class="emojione" alt="🛕" title=":hindu_temple:" src="/packs/emoji/1f6d5.svg" />',
      );
      expect(emojify('🕍')).toEqual(
        '<img draggable="false" class="emojione" alt="🕍" title=":synagogue:" src="/packs/emoji/1f54d.svg" />',
      );
      expect(emojify('⛩️')).toEqual(
        '<img draggable="false" class="emojione" alt="⛩️" title=":shinto_shrine:" src="/packs/emoji/26e9.svg" />',
      );
      expect(emojify('🕋')).toEqual(
        '<img draggable="false" class="emojione" alt="🕋" title=":kaaba:" src="/packs/emoji/1f54b.svg" />',
      );
      expect(emojify('⛲')).toEqual(
        '<img draggable="false" class="emojione" alt="⛲" title=":fountain:" src="/packs/emoji/26f2.svg" />',
      );
      expect(emojify('⛺')).toEqual(
        '<img draggable="false" class="emojione" alt="⛺" title=":tent:" src="/packs/emoji/26fa.svg" />',
      );
      expect(emojify('🌁')).toEqual(
        '<img draggable="false" class="emojione" alt="🌁" title=":foggy:" src="/packs/emoji/1f301.svg" />',
      );
      expect(emojify('🌃')).toEqual(
        '<img draggable="false" class="emojione" alt="🌃" title=":night_with_stars:" src="/packs/emoji/1f303.svg" />',
      );
      expect(emojify('🏙️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏙️" title=":cityscape:" src="/packs/emoji/1f3d9.svg" />',
      );
      expect(emojify('🌄')).toEqual(
        '<img draggable="false" class="emojione" alt="🌄" title=":sunrise_over_mountains:" src="/packs/emoji/1f304.svg" />',
      );
      expect(emojify('🌅')).toEqual(
        '<img draggable="false" class="emojione" alt="🌅" title=":sunrise:" src="/packs/emoji/1f305.svg" />',
      );
      expect(emojify('🌆')).toEqual(
        '<img draggable="false" class="emojione" alt="🌆" title=":city_sunset:" src="/packs/emoji/1f306.svg" />',
      );
      expect(emojify('🌇')).toEqual(
        '<img draggable="false" class="emojione" alt="🌇" title=":city_sunrise:" src="/packs/emoji/1f307.svg" />',
      );
      expect(emojify('🌉')).toEqual(
        '<img draggable="false" class="emojione" alt="🌉" title=":bridge_at_night:" src="/packs/emoji/1f309.svg" />',
      );
      expect(emojify('♨️')).toEqual(
        '<img draggable="false" class="emojione" alt="♨️" title=":hotsprings:" src="/packs/emoji/2668.svg" />',
      );
      expect(emojify('🎠')).toEqual(
        '<img draggable="false" class="emojione" alt="🎠" title=":carousel_horse:" src="/packs/emoji/1f3a0.svg" />',
      );
      expect(emojify('🛝')).toEqual(
        '<img draggable="false" class="emojione" alt="🛝" title=":playground_slide:" src="/packs/emoji/1f6dd.svg" />',
      );
      expect(emojify('🎡')).toEqual(
        '<img draggable="false" class="emojione" alt="🎡" title=":ferris_wheel:" src="/packs/emoji/1f3a1.svg" />',
      );
      expect(emojify('🎢')).toEqual(
        '<img draggable="false" class="emojione" alt="🎢" title=":roller_coaster:" src="/packs/emoji/1f3a2.svg" />',
      );
      expect(emojify('💈')).toEqual(
        '<img draggable="false" class="emojione" alt="💈" title=":barber:" src="/packs/emoji/1f488.svg" />',
      );
      expect(emojify('🎪')).toEqual(
        '<img draggable="false" class="emojione" alt="🎪" title=":circus_tent:" src="/packs/emoji/1f3aa.svg" />',
      );
      expect(emojify('🚂')).toEqual(
        '<img draggable="false" class="emojione" alt="🚂" title=":steam_locomotive:" src="/packs/emoji/1f682.svg" />',
      );
      expect(emojify('🚃')).toEqual(
        '<img draggable="false" class="emojione" alt="🚃" title=":railway_car:" src="/packs/emoji/1f683.svg" />',
      );
      expect(emojify('🚄')).toEqual(
        '<img draggable="false" class="emojione" alt="🚄" title=":bullettrain_side:" src="/packs/emoji/1f684.svg" />',
      );
      expect(emojify('🚅')).toEqual(
        '<img draggable="false" class="emojione" alt="🚅" title=":bullettrain_front:" src="/packs/emoji/1f685.svg" />',
      );
      expect(emojify('🚆')).toEqual(
        '<img draggable="false" class="emojione" alt="🚆" title=":train2:" src="/packs/emoji/1f686.svg" />',
      );
      expect(emojify('🚇')).toEqual(
        '<img draggable="false" class="emojione" alt="🚇" title=":metro:" src="/packs/emoji/1f687.svg" />',
      );
      expect(emojify('🚈')).toEqual(
        '<img draggable="false" class="emojione" alt="🚈" title=":light_rail:" src="/packs/emoji/1f688.svg" />',
      );
      expect(emojify('🚉')).toEqual(
        '<img draggable="false" class="emojione" alt="🚉" title=":station:" src="/packs/emoji/1f689.svg" />',
      );
      expect(emojify('🚊')).toEqual(
        '<img draggable="false" class="emojione" alt="🚊" title=":tram:" src="/packs/emoji/1f68a.svg" />',
      );
      expect(emojify('🚝')).toEqual(
        '<img draggable="false" class="emojione" alt="🚝" title=":monorail:" src="/packs/emoji/1f69d.svg" />',
      );
      expect(emojify('🚞')).toEqual(
        '<img draggable="false" class="emojione" alt="🚞" title=":mountain_railway:" src="/packs/emoji/1f69e.svg" />',
      );
      expect(emojify('🚋')).toEqual(
        '<img draggable="false" class="emojione" alt="🚋" title=":train:" src="/packs/emoji/1f68b.svg" />',
      );
      expect(emojify('🚌')).toEqual(
        '<img draggable="false" class="emojione" alt="🚌" title=":bus:" src="/packs/emoji/1f68c.svg" />',
      );
      expect(emojify('🚍')).toEqual(
        '<img draggable="false" class="emojione" alt="🚍" title=":oncoming_bus:" src="/packs/emoji/1f68d.svg" />',
      );
      expect(emojify('🚎')).toEqual(
        '<img draggable="false" class="emojione" alt="🚎" title=":trolleybus:" src="/packs/emoji/1f68e.svg" />',
      );
      expect(emojify('🚐')).toEqual(
        '<img draggable="false" class="emojione" alt="🚐" title=":minibus:" src="/packs/emoji/1f690.svg" />',
      );
      expect(emojify('🚑')).toEqual(
        '<img draggable="false" class="emojione" alt="🚑" title=":ambulance:" src="/packs/emoji/1f691.svg" />',
      );
      expect(emojify('🚒')).toEqual(
        '<img draggable="false" class="emojione" alt="🚒" title=":fire_engine:" src="/packs/emoji/1f692.svg" />',
      );
      expect(emojify('🚓')).toEqual(
        '<img draggable="false" class="emojione" alt="🚓" title=":police_car:" src="/packs/emoji/1f693.svg" />',
      );
      expect(emojify('🚔')).toEqual(
        '<img draggable="false" class="emojione" alt="🚔" title=":oncoming_police_car:" src="/packs/emoji/1f694.svg" />',
      );
      expect(emojify('🚕')).toEqual(
        '<img draggable="false" class="emojione" alt="🚕" title=":taxi:" src="/packs/emoji/1f695.svg" />',
      );
      expect(emojify('🚖')).toEqual(
        '<img draggable="false" class="emojione" alt="🚖" title=":oncoming_taxi:" src="/packs/emoji/1f696.svg" />',
      );
      expect(emojify('🚗')).toEqual(
        '<img draggable="false" class="emojione" alt="🚗" title=":car:" src="/packs/emoji/1f697.svg" />',
      );
      expect(emojify('🚘')).toEqual(
        '<img draggable="false" class="emojione" alt="🚘" title=":oncoming_automobile:" src="/packs/emoji/1f698.svg" />',
      );
      expect(emojify('🚙')).toEqual(
        '<img draggable="false" class="emojione" alt="🚙" title=":blue_car:" src="/packs/emoji/1f699.svg" />',
      );
      expect(emojify('🛻')).toEqual(
        '<img draggable="false" class="emojione" alt="🛻" title=":pickup_truck:" src="/packs/emoji/1f6fb.svg" />',
      );
      expect(emojify('🚚')).toEqual(
        '<img draggable="false" class="emojione" alt="🚚" title=":truck:" src="/packs/emoji/1f69a.svg" />',
      );
      expect(emojify('🚛')).toEqual(
        '<img draggable="false" class="emojione" alt="🚛" title=":articulated_lorry:" src="/packs/emoji/1f69b.svg" />',
      );
      expect(emojify('🚜')).toEqual(
        '<img draggable="false" class="emojione" alt="🚜" title=":tractor:" src="/packs/emoji/1f69c.svg" />',
      );
      expect(emojify('🏎️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏎️" title=":racing_car:" src="/packs/emoji/1f3ce.svg" />',
      );
      expect(emojify('🏍️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏍️" title=":racing_motorcycle:" src="/packs/emoji/1f3cd.svg" />',
      );
      expect(emojify('🛵')).toEqual(
        '<img draggable="false" class="emojione" alt="🛵" title=":motor_scooter:" src="/packs/emoji/1f6f5.svg" />',
      );
      expect(emojify('🦽')).toEqual(
        '<img draggable="false" class="emojione" alt="🦽" title=":manual_wheelchair:" src="/packs/emoji/1f9bd.svg" />',
      );
      expect(emojify('🦼')).toEqual(
        '<img draggable="false" class="emojione" alt="🦼" title=":motorized_wheelchair:" src="/packs/emoji/1f9bc.svg" />',
      );
      expect(emojify('🛺')).toEqual(
        '<img draggable="false" class="emojione" alt="🛺" title=":auto_rickshaw:" src="/packs/emoji/1f6fa.svg" />',
      );
      expect(emojify('🚲')).toEqual(
        '<img draggable="false" class="emojione" alt="🚲" title=":bike:" src="/packs/emoji/1f6b2.svg" />',
      );
      expect(emojify('🛴')).toEqual(
        '<img draggable="false" class="emojione" alt="🛴" title=":scooter:" src="/packs/emoji/1f6f4.svg" />',
      );
      expect(emojify('🛹')).toEqual(
        '<img draggable="false" class="emojione" alt="🛹" title=":skateboard:" src="/packs/emoji/1f6f9.svg" />',
      );
      expect(emojify('🛼')).toEqual(
        '<img draggable="false" class="emojione" alt="🛼" title=":roller_skate:" src="/packs/emoji/1f6fc.svg" />',
      );
      expect(emojify('🚏')).toEqual(
        '<img draggable="false" class="emojione" alt="🚏" title=":busstop:" src="/packs/emoji/1f68f.svg" />',
      );
      expect(emojify('🛣️')).toEqual(
        '<img draggable="false" class="emojione" alt="🛣️" title=":motorway:" src="/packs/emoji/1f6e3.svg" />',
      );
      expect(emojify('🛤️')).toEqual(
        '<img draggable="false" class="emojione" alt="🛤️" title=":railway_track:" src="/packs/emoji/1f6e4.svg" />',
      );
      expect(emojify('🛢️')).toEqual(
        '<img draggable="false" class="emojione" alt="🛢️" title=":oil_drum:" src="/packs/emoji/1f6e2.svg" />',
      );
      expect(emojify('⛽')).toEqual(
        '<img draggable="false" class="emojione" alt="⛽" title=":fuelpump:" src="/packs/emoji/26fd.svg" />',
      );
      expect(emojify('🛞')).toEqual(
        '<img draggable="false" class="emojione" alt="🛞" title=":wheel:" src="/packs/emoji/1f6de.svg" />',
      );
      expect(emojify('🚨')).toEqual(
        '<img draggable="false" class="emojione" alt="🚨" title=":rotating_light:" src="/packs/emoji/1f6a8.svg" />',
      );
      expect(emojify('🚥')).toEqual(
        '<img draggable="false" class="emojione" alt="🚥" title=":traffic_light:" src="/packs/emoji/1f6a5.svg" />',
      );
      expect(emojify('🚦')).toEqual(
        '<img draggable="false" class="emojione" alt="🚦" title=":vertical_traffic_light:" src="/packs/emoji/1f6a6.svg" />',
      );
      expect(emojify('🛑')).toEqual(
        '<img draggable="false" class="emojione" alt="🛑" title=":octagonal_sign:" src="/packs/emoji/1f6d1.svg" />',
      );
      expect(emojify('🚧')).toEqual(
        '<img draggable="false" class="emojione" alt="🚧" title=":construction:" src="/packs/emoji/1f6a7.svg" />',
      );
      expect(emojify('⚓')).toEqual(
        '<img draggable="false" class="emojione" alt="⚓" title=":anchor:" src="/packs/emoji/2693.svg" />',
      );
      expect(emojify('🛟')).toEqual(
        '<img draggable="false" class="emojione" alt="🛟" title=":ring_buoy:" src="/packs/emoji/1f6df.svg" />',
      );
      expect(emojify('⛵')).toEqual(
        '<img draggable="false" class="emojione" alt="⛵" title=":boat:" src="/packs/emoji/26f5.svg" />',
      );
      expect(emojify('🛶')).toEqual(
        '<img draggable="false" class="emojione" alt="🛶" title=":canoe:" src="/packs/emoji/1f6f6.svg" />',
      );
      expect(emojify('🚤')).toEqual(
        '<img draggable="false" class="emojione" alt="🚤" title=":speedboat:" src="/packs/emoji/1f6a4.svg" />',
      );
      expect(emojify('🛳️')).toEqual(
        '<img draggable="false" class="emojione" alt="🛳️" title=":passenger_ship:" src="/packs/emoji/1f6f3.svg" />',
      );
      expect(emojify('⛴️')).toEqual(
        '<img draggable="false" class="emojione" alt="⛴️" title=":ferry:" src="/packs/emoji/26f4.svg" />',
      );
      expect(emojify('🛥️')).toEqual(
        '<img draggable="false" class="emojione" alt="🛥️" title=":motor_boat:" src="/packs/emoji/1f6e5.svg" />',
      );
      expect(emojify('🚢')).toEqual(
        '<img draggable="false" class="emojione" alt="🚢" title=":ship:" src="/packs/emoji/1f6a2.svg" />',
      );
      expect(emojify('✈️')).toEqual(
        '<img draggable="false" class="emojione" alt="✈️" title=":airplane:" src="/packs/emoji/2708.svg" />',
      );
      expect(emojify('🛩️')).toEqual(
        '<img draggable="false" class="emojione" alt="🛩️" title=":small_airplane:" src="/packs/emoji/1f6e9.svg" />',
      );
      expect(emojify('🛫')).toEqual(
        '<img draggable="false" class="emojione" alt="🛫" title=":airplane_departure:" src="/packs/emoji/1f6eb.svg" />',
      );
      expect(emojify('🛬')).toEqual(
        '<img draggable="false" class="emojione" alt="🛬" title=":airplane_arriving:" src="/packs/emoji/1f6ec.svg" />',
      );
      expect(emojify('🪂')).toEqual(
        '<img draggable="false" class="emojione" alt="🪂" title=":parachute:" src="/packs/emoji/1fa82.svg" />',
      );
      expect(emojify('💺')).toEqual(
        '<img draggable="false" class="emojione" alt="💺" title=":seat:" src="/packs/emoji/1f4ba.svg" />',
      );
      expect(emojify('🚁')).toEqual(
        '<img draggable="false" class="emojione" alt="🚁" title=":helicopter:" src="/packs/emoji/1f681.svg" />',
      );
      expect(emojify('🚟')).toEqual(
        '<img draggable="false" class="emojione" alt="🚟" title=":suspension_railway:" src="/packs/emoji/1f69f.svg" />',
      );
      expect(emojify('🚠')).toEqual(
        '<img draggable="false" class="emojione" alt="🚠" title=":mountain_cableway:" src="/packs/emoji/1f6a0.svg" />',
      );
      expect(emojify('🚡')).toEqual(
        '<img draggable="false" class="emojione" alt="🚡" title=":aerial_tramway:" src="/packs/emoji/1f6a1.svg" />',
      );
      expect(emojify('🛰️')).toEqual(
        '<img draggable="false" class="emojione" alt="🛰️" title=":satellite:" src="/packs/emoji/1f6f0.svg" />',
      );
      expect(emojify('🚀')).toEqual(
        '<img draggable="false" class="emojione" alt="🚀" title=":rocket:" src="/packs/emoji/1f680.svg" />',
      );
      expect(emojify('🛸')).toEqual(
        '<img draggable="false" class="emojione" alt="🛸" title=":flying_saucer:" src="/packs/emoji/1f6f8.svg" />',
      );
      expect(emojify('🛎️')).toEqual(
        '<img draggable="false" class="emojione" alt="🛎️" title=":bellhop_bell:" src="/packs/emoji/1f6ce.svg" />',
      );
      expect(emojify('🧳')).toEqual(
        '<img draggable="false" class="emojione" alt="🧳" title=":luggage:" src="/packs/emoji/1f9f3.svg" />',
      );
      expect(emojify('⌛')).toEqual(
        '<img draggable="false" class="emojione" alt="⌛" title=":hourglass:" src="/packs/emoji/231b.svg" />',
      );
      expect(emojify('⏳')).toEqual(
        '<img draggable="false" class="emojione" alt="⏳" title=":hourglass_flowing_sand:" src="/packs/emoji/23f3.svg" />',
      );
      expect(emojify('⌚')).toEqual(
        '<img draggable="false" class="emojione" alt="⌚" title=":watch:" src="/packs/emoji/231a.svg" />',
      );
      expect(emojify('⏰')).toEqual(
        '<img draggable="false" class="emojione" alt="⏰" title=":alarm_clock:" src="/packs/emoji/23f0.svg" />',
      );
      expect(emojify('⏱️')).toEqual(
        '<img draggable="false" class="emojione" alt="⏱️" title=":stopwatch:" src="/packs/emoji/23f1.svg" />',
      );
      expect(emojify('⏲️')).toEqual(
        '<img draggable="false" class="emojione" alt="⏲️" title=":timer_clock:" src="/packs/emoji/23f2.svg" />',
      );
      expect(emojify('🕰️')).toEqual(
        '<img draggable="false" class="emojione" alt="🕰️" title=":mantelpiece_clock:" src="/packs/emoji/1f570.svg" />',
      );
      expect(emojify('🕛')).toEqual(
        '<img draggable="false" class="emojione" alt="🕛" title=":clock12:" src="/packs/emoji/1f55b.svg" />',
      );
      expect(emojify('🕧')).toEqual(
        '<img draggable="false" class="emojione" alt="🕧" title=":clock1230:" src="/packs/emoji/1f567.svg" />',
      );
      expect(emojify('🕐')).toEqual(
        '<img draggable="false" class="emojione" alt="🕐" title=":clock1:" src="/packs/emoji/1f550.svg" />',
      );
      expect(emojify('🕜')).toEqual(
        '<img draggable="false" class="emojione" alt="🕜" title=":clock130:" src="/packs/emoji/1f55c.svg" />',
      );
      expect(emojify('🕑')).toEqual(
        '<img draggable="false" class="emojione" alt="🕑" title=":clock2:" src="/packs/emoji/1f551.svg" />',
      );
      expect(emojify('🕝')).toEqual(
        '<img draggable="false" class="emojione" alt="🕝" title=":clock230:" src="/packs/emoji/1f55d.svg" />',
      );
      expect(emojify('🕒')).toEqual(
        '<img draggable="false" class="emojione" alt="🕒" title=":clock3:" src="/packs/emoji/1f552.svg" />',
      );
      expect(emojify('🕞')).toEqual(
        '<img draggable="false" class="emojione" alt="🕞" title=":clock330:" src="/packs/emoji/1f55e.svg" />',
      );
      expect(emojify('🕓')).toEqual(
        '<img draggable="false" class="emojione" alt="🕓" title=":clock4:" src="/packs/emoji/1f553.svg" />',
      );
      expect(emojify('🕟')).toEqual(
        '<img draggable="false" class="emojione" alt="🕟" title=":clock430:" src="/packs/emoji/1f55f.svg" />',
      );
      expect(emojify('🕔')).toEqual(
        '<img draggable="false" class="emojione" alt="🕔" title=":clock5:" src="/packs/emoji/1f554.svg" />',
      );
      expect(emojify('🕠')).toEqual(
        '<img draggable="false" class="emojione" alt="🕠" title=":clock530:" src="/packs/emoji/1f560.svg" />',
      );
      expect(emojify('🕕')).toEqual(
        '<img draggable="false" class="emojione" alt="🕕" title=":clock6:" src="/packs/emoji/1f555.svg" />',
      );
      expect(emojify('🕡')).toEqual(
        '<img draggable="false" class="emojione" alt="🕡" title=":clock630:" src="/packs/emoji/1f561.svg" />',
      );
      expect(emojify('🕖')).toEqual(
        '<img draggable="false" class="emojione" alt="🕖" title=":clock7:" src="/packs/emoji/1f556.svg" />',
      );
      expect(emojify('🕢')).toEqual(
        '<img draggable="false" class="emojione" alt="🕢" title=":clock730:" src="/packs/emoji/1f562.svg" />',
      );
      expect(emojify('🕗')).toEqual(
        '<img draggable="false" class="emojione" alt="🕗" title=":clock8:" src="/packs/emoji/1f557.svg" />',
      );
      expect(emojify('🕣')).toEqual(
        '<img draggable="false" class="emojione" alt="🕣" title=":clock830:" src="/packs/emoji/1f563.svg" />',
      );
      expect(emojify('🕘')).toEqual(
        '<img draggable="false" class="emojione" alt="🕘" title=":clock9:" src="/packs/emoji/1f558.svg" />',
      );
      expect(emojify('🕤')).toEqual(
        '<img draggable="false" class="emojione" alt="🕤" title=":clock930:" src="/packs/emoji/1f564.svg" />',
      );
      expect(emojify('🕙')).toEqual(
        '<img draggable="false" class="emojione" alt="🕙" title=":clock10:" src="/packs/emoji/1f559.svg" />',
      );
      expect(emojify('🕥')).toEqual(
        '<img draggable="false" class="emojione" alt="🕥" title=":clock1030:" src="/packs/emoji/1f565.svg" />',
      );
      expect(emojify('🕚')).toEqual(
        '<img draggable="false" class="emojione" alt="🕚" title=":clock11:" src="/packs/emoji/1f55a.svg" />',
      );
      expect(emojify('🕦')).toEqual(
        '<img draggable="false" class="emojione" alt="🕦" title=":clock1130:" src="/packs/emoji/1f566.svg" />',
      );
      expect(emojify('🌑')).toEqual(
        '<img draggable="false" class="emojione" alt="🌑" title=":new_moon:" src="/packs/emoji/1f311.svg" />',
      );
      expect(emojify('🌒')).toEqual(
        '<img draggable="false" class="emojione" alt="🌒" title=":waxing_crescent_moon:" src="/packs/emoji/1f312.svg" />',
      );
      expect(emojify('🌓')).toEqual(
        '<img draggable="false" class="emojione" alt="🌓" title=":first_quarter_moon:" src="/packs/emoji/1f313.svg" />',
      );
      expect(emojify('🌔')).toEqual(
        '<img draggable="false" class="emojione" alt="🌔" title=":moon:" src="/packs/emoji/1f314.svg" />',
      );
      expect(emojify('🌕')).toEqual(
        '<img draggable="false" class="emojione" alt="🌕" title=":full_moon:" src="/packs/emoji/1f315.svg" />',
      );
      expect(emojify('🌖')).toEqual(
        '<img draggable="false" class="emojione" alt="🌖" title=":waning_gibbous_moon:" src="/packs/emoji/1f316.svg" />',
      );
      expect(emojify('🌗')).toEqual(
        '<img draggable="false" class="emojione" alt="🌗" title=":last_quarter_moon:" src="/packs/emoji/1f317.svg" />',
      );
      expect(emojify('🌘')).toEqual(
        '<img draggable="false" class="emojione" alt="🌘" title=":waning_crescent_moon:" src="/packs/emoji/1f318.svg" />',
      );
      expect(emojify('🌙')).toEqual(
        '<img draggable="false" class="emojione" alt="🌙" title=":crescent_moon:" src="/packs/emoji/1f319.svg" />',
      );
      expect(emojify('🌚')).toEqual(
        '<img draggable="false" class="emojione" alt="🌚" title=":new_moon_with_face:" src="/packs/emoji/1f31a.svg" />',
      );
      expect(emojify('🌛')).toEqual(
        '<img draggable="false" class="emojione" alt="🌛" title=":first_quarter_moon_with_face:" src="/packs/emoji/1f31b.svg" />',
      );
      expect(emojify('🌜')).toEqual(
        '<img draggable="false" class="emojione" alt="🌜" title=":last_quarter_moon_with_face:" src="/packs/emoji/1f31c.svg" />',
      );
      expect(emojify('🌡️')).toEqual(
        '<img draggable="false" class="emojione" alt="🌡️" title=":thermometer:" src="/packs/emoji/1f321.svg" />',
      );
      expect(emojify('☀️')).toEqual(
        '<img draggable="false" class="emojione" alt="☀️" title=":sunny:" src="/packs/emoji/2600.svg" />',
      );
      expect(emojify('🌝')).toEqual(
        '<img draggable="false" class="emojione" alt="🌝" title=":full_moon_with_face:" src="/packs/emoji/1f31d.svg" />',
      );
      expect(emojify('🌞')).toEqual(
        '<img draggable="false" class="emojione" alt="🌞" title=":sun_with_face:" src="/packs/emoji/1f31e.svg" />',
      );
      expect(emojify('🪐')).toEqual(
        '<img draggable="false" class="emojione" alt="🪐" title=":ringed_planet:" src="/packs/emoji/1fa90.svg" />',
      );
      expect(emojify('⭐')).toEqual(
        '<img draggable="false" class="emojione" alt="⭐" title=":star:" src="/packs/emoji/2b50.svg" />',
      );
      expect(emojify('🌟')).toEqual(
        '<img draggable="false" class="emojione" alt="🌟" title=":star2:" src="/packs/emoji/1f31f.svg" />',
      );
      expect(emojify('🌠')).toEqual(
        '<img draggable="false" class="emojione" alt="🌠" title=":stars:" src="/packs/emoji/1f320.svg" />',
      );
      expect(emojify('🌌')).toEqual(
        '<img draggable="false" class="emojione" alt="🌌" title=":milky_way:" src="/packs/emoji/1f30c.svg" />',
      );
      expect(emojify('☁️')).toEqual(
        '<img draggable="false" class="emojione" alt="☁️" title=":cloud:" src="/packs/emoji/2601.svg" />',
      );
      expect(emojify('⛅')).toEqual(
        '<img draggable="false" class="emojione" alt="⛅" title=":partly_sunny:" src="/packs/emoji/26c5.svg" />',
      );
      expect(emojify('⛈️')).toEqual(
        '<img draggable="false" class="emojione" alt="⛈️" title=":thunder_cloud_and_rain:" src="/packs/emoji/26c8.svg" />',
      );
      expect(emojify('🌤️')).toEqual(
        '<img draggable="false" class="emojione" alt="🌤️" title=":mostly_sunny:" src="/packs/emoji/1f324.svg" />',
      );
      expect(emojify('🌥️')).toEqual(
        '<img draggable="false" class="emojione" alt="🌥️" title=":barely_sunny:" src="/packs/emoji/1f325.svg" />',
      );
      expect(emojify('🌦️')).toEqual(
        '<img draggable="false" class="emojione" alt="🌦️" title=":partly_sunny_rain:" src="/packs/emoji/1f326.svg" />',
      );
      expect(emojify('🌧️')).toEqual(
        '<img draggable="false" class="emojione" alt="🌧️" title=":rain_cloud:" src="/packs/emoji/1f327.svg" />',
      );
      expect(emojify('🌨️')).toEqual(
        '<img draggable="false" class="emojione" alt="🌨️" title=":snow_cloud:" src="/packs/emoji/1f328.svg" />',
      );
      expect(emojify('🌩️')).toEqual(
        '<img draggable="false" class="emojione" alt="🌩️" title=":lightning:" src="/packs/emoji/1f329.svg" />',
      );
      expect(emojify('🌪️')).toEqual(
        '<img draggable="false" class="emojione" alt="🌪️" title=":tornado:" src="/packs/emoji/1f32a.svg" />',
      );
      expect(emojify('🌫️')).toEqual(
        '<img draggable="false" class="emojione" alt="🌫️" title=":fog:" src="/packs/emoji/1f32b.svg" />',
      );
      expect(emojify('🌬️')).toEqual(
        '<img draggable="false" class="emojione" alt="🌬️" title=":wind_blowing_face:" src="/packs/emoji/1f32c.svg" />',
      );
      expect(emojify('🌀')).toEqual(
        '<img draggable="false" class="emojione" alt="🌀" title=":cyclone:" src="/packs/emoji/1f300.svg" />',
      );
      expect(emojify('🌈')).toEqual(
        '<img draggable="false" class="emojione" alt="🌈" title=":rainbow:" src="/packs/emoji/1f308.svg" />',
      );
      expect(emojify('🌂')).toEqual(
        '<img draggable="false" class="emojione" alt="🌂" title=":closed_umbrella:" src="/packs/emoji/1f302.svg" />',
      );
      expect(emojify('☂️')).toEqual(
        '<img draggable="false" class="emojione" alt="☂️" title=":umbrella:" src="/packs/emoji/2602.svg" />',
      );
      expect(emojify('☔')).toEqual(
        '<img draggable="false" class="emojione" alt="☔" title=":umbrella_with_rain_drops:" src="/packs/emoji/2614.svg" />',
      );
      expect(emojify('⛱️')).toEqual(
        '<img draggable="false" class="emojione" alt="⛱️" title=":umbrella_on_ground:" src="/packs/emoji/26f1.svg" />',
      );
      expect(emojify('⚡')).toEqual(
        '<img draggable="false" class="emojione" alt="⚡" title=":zap:" src="/packs/emoji/26a1.svg" />',
      );
      expect(emojify('❄️')).toEqual(
        '<img draggable="false" class="emojione" alt="❄️" title=":snowflake:" src="/packs/emoji/2744.svg" />',
      );
      expect(emojify('☃️')).toEqual(
        '<img draggable="false" class="emojione" alt="☃️" title=":snowman:" src="/packs/emoji/2603.svg" />',
      );
      expect(emojify('⛄')).toEqual(
        '<img draggable="false" class="emojione" alt="⛄" title=":snowman_without_snow:" src="/packs/emoji/26c4.svg" />',
      );
      expect(emojify('☄️')).toEqual(
        '<img draggable="false" class="emojione" alt="☄️" title=":comet:" src="/packs/emoji/2604.svg" />',
      );
      expect(emojify('🔥')).toEqual(
        '<img draggable="false" class="emojione" alt="🔥" title=":fire:" src="/packs/emoji/1f525.svg" />',
      );
      expect(emojify('💧')).toEqual(
        '<img draggable="false" class="emojione" alt="💧" title=":droplet:" src="/packs/emoji/1f4a7.svg" />',
      );
      expect(emojify('🌊')).toEqual(
        '<img draggable="false" class="emojione" alt="🌊" title=":ocean:" src="/packs/emoji/1f30a.svg" />',
      );
      expect(emojify('🎃')).toEqual(
        '<img draggable="false" class="emojione" alt="🎃" title=":jack_o_lantern:" src="/packs/emoji/1f383.svg" />',
      );
      expect(emojify('🎄')).toEqual(
        '<img draggable="false" class="emojione" alt="🎄" title=":christmas_tree:" src="/packs/emoji/1f384.svg" />',
      );
      expect(emojify('🎆')).toEqual(
        '<img draggable="false" class="emojione" alt="🎆" title=":fireworks:" src="/packs/emoji/1f386.svg" />',
      );
      expect(emojify('🎇')).toEqual(
        '<img draggable="false" class="emojione" alt="🎇" title=":sparkler:" src="/packs/emoji/1f387.svg" />',
      );
      expect(emojify('🧨')).toEqual(
        '<img draggable="false" class="emojione" alt="🧨" title=":firecracker:" src="/packs/emoji/1f9e8.svg" />',
      );
      expect(emojify('✨')).toEqual(
        '<img draggable="false" class="emojione" alt="✨" title=":sparkles:" src="/packs/emoji/2728.svg" />',
      );
      expect(emojify('🎈')).toEqual(
        '<img draggable="false" class="emojione" alt="🎈" title=":balloon:" src="/packs/emoji/1f388.svg" />',
      );
      expect(emojify('🎉')).toEqual(
        '<img draggable="false" class="emojione" alt="🎉" title=":tada:" src="/packs/emoji/1f389.svg" />',
      );
      expect(emojify('🎊')).toEqual(
        '<img draggable="false" class="emojione" alt="🎊" title=":confetti_ball:" src="/packs/emoji/1f38a.svg" />',
      );
      expect(emojify('🎋')).toEqual(
        '<img draggable="false" class="emojione" alt="🎋" title=":tanabata_tree:" src="/packs/emoji/1f38b.svg" />',
      );
      expect(emojify('🎍')).toEqual(
        '<img draggable="false" class="emojione" alt="🎍" title=":bamboo:" src="/packs/emoji/1f38d.svg" />',
      );
      expect(emojify('🎎')).toEqual(
        '<img draggable="false" class="emojione" alt="🎎" title=":dolls:" src="/packs/emoji/1f38e.svg" />',
      );
      expect(emojify('🎏')).toEqual(
        '<img draggable="false" class="emojione" alt="🎏" title=":flags:" src="/packs/emoji/1f38f.svg" />',
      );
      expect(emojify('🎐')).toEqual(
        '<img draggable="false" class="emojione" alt="🎐" title=":wind_chime:" src="/packs/emoji/1f390.svg" />',
      );
      expect(emojify('🎑')).toEqual(
        '<img draggable="false" class="emojione" alt="🎑" title=":rice_scene:" src="/packs/emoji/1f391.svg" />',
      );
      expect(emojify('🧧')).toEqual(
        '<img draggable="false" class="emojione" alt="🧧" title=":red_envelope:" src="/packs/emoji/1f9e7.svg" />',
      );
      expect(emojify('🎀')).toEqual(
        '<img draggable="false" class="emojione" alt="🎀" title=":ribbon:" src="/packs/emoji/1f380.svg" />',
      );
      expect(emojify('🎁')).toEqual(
        '<img draggable="false" class="emojione" alt="🎁" title=":gift:" src="/packs/emoji/1f381.svg" />',
      );
      expect(emojify('🎗️')).toEqual(
        '<img draggable="false" class="emojione" alt="🎗️" title=":reminder_ribbon:" src="/packs/emoji/1f397.svg" />',
      );
      expect(emojify('🎟️')).toEqual(
        '<img draggable="false" class="emojione" alt="🎟️" title=":admission_tickets:" src="/packs/emoji/1f39f.svg" />',
      );
      expect(emojify('🎫')).toEqual(
        '<img draggable="false" class="emojione" alt="🎫" title=":ticket:" src="/packs/emoji/1f3ab.svg" />',
      );
      expect(emojify('🎖️')).toEqual(
        '<img draggable="false" class="emojione" alt="🎖️" title=":medal:" src="/packs/emoji/1f396.svg" />',
      );
      expect(emojify('🏆')).toEqual(
        '<img draggable="false" class="emojione" alt="🏆" title=":trophy:" src="/packs/emoji/1f3c6.svg" />',
      );
      expect(emojify('🏅')).toEqual(
        '<img draggable="false" class="emojione" alt="🏅" title=":sports_medal:" src="/packs/emoji/1f3c5.svg" />',
      );
      expect(emojify('🥇')).toEqual(
        '<img draggable="false" class="emojione" alt="🥇" title=":first_place_medal:" src="/packs/emoji/1f947.svg" />',
      );
      expect(emojify('🥈')).toEqual(
        '<img draggable="false" class="emojione" alt="🥈" title=":second_place_medal:" src="/packs/emoji/1f948.svg" />',
      );
      expect(emojify('🥉')).toEqual(
        '<img draggable="false" class="emojione" alt="🥉" title=":third_place_medal:" src="/packs/emoji/1f949.svg" />',
      );
      expect(emojify('⚽')).toEqual(
        '<img draggable="false" class="emojione" alt="⚽" title=":soccer:" src="/packs/emoji/26bd.svg" />',
      );
      expect(emojify('⚾')).toEqual(
        '<img draggable="false" class="emojione" alt="⚾" title=":baseball:" src="/packs/emoji/26be.svg" />',
      );
      expect(emojify('🥎')).toEqual(
        '<img draggable="false" class="emojione" alt="🥎" title=":softball:" src="/packs/emoji/1f94e.svg" />',
      );
      expect(emojify('🏀')).toEqual(
        '<img draggable="false" class="emojione" alt="🏀" title=":basketball:" src="/packs/emoji/1f3c0.svg" />',
      );
      expect(emojify('🏐')).toEqual(
        '<img draggable="false" class="emojione" alt="🏐" title=":volleyball:" src="/packs/emoji/1f3d0.svg" />',
      );
      expect(emojify('🏈')).toEqual(
        '<img draggable="false" class="emojione" alt="🏈" title=":football:" src="/packs/emoji/1f3c8.svg" />',
      );
      expect(emojify('🏉')).toEqual(
        '<img draggable="false" class="emojione" alt="🏉" title=":rugby_football:" src="/packs/emoji/1f3c9.svg" />',
      );
      expect(emojify('🎾')).toEqual(
        '<img draggable="false" class="emojione" alt="🎾" title=":tennis:" src="/packs/emoji/1f3be.svg" />',
      );
      expect(emojify('🥏')).toEqual(
        '<img draggable="false" class="emojione" alt="🥏" title=":flying_disc:" src="/packs/emoji/1f94f.svg" />',
      );
      expect(emojify('🎳')).toEqual(
        '<img draggable="false" class="emojione" alt="🎳" title=":bowling:" src="/packs/emoji/1f3b3.svg" />',
      );
      expect(emojify('🏏')).toEqual(
        '<img draggable="false" class="emojione" alt="🏏" title=":cricket_bat_and_ball:" src="/packs/emoji/1f3cf.svg" />',
      );
      expect(emojify('🏑')).toEqual(
        '<img draggable="false" class="emojione" alt="🏑" title=":field_hockey_stick_and_ball:" src="/packs/emoji/1f3d1.svg" />',
      );
      expect(emojify('🏒')).toEqual(
        '<img draggable="false" class="emojione" alt="🏒" title=":ice_hockey_stick_and_puck:" src="/packs/emoji/1f3d2.svg" />',
      );
      expect(emojify('🥍')).toEqual(
        '<img draggable="false" class="emojione" alt="🥍" title=":lacrosse:" src="/packs/emoji/1f94d.svg" />',
      );
      expect(emojify('🏓')).toEqual(
        '<img draggable="false" class="emojione" alt="🏓" title=":table_tennis_paddle_and_ball:" src="/packs/emoji/1f3d3.svg" />',
      );
      expect(emojify('🏸')).toEqual(
        '<img draggable="false" class="emojione" alt="🏸" title=":badminton_racquet_and_shuttlecock:" src="/packs/emoji/1f3f8.svg" />',
      );
      expect(emojify('🥊')).toEqual(
        '<img draggable="false" class="emojione" alt="🥊" title=":boxing_glove:" src="/packs/emoji/1f94a.svg" />',
      );
      expect(emojify('🥋')).toEqual(
        '<img draggable="false" class="emojione" alt="🥋" title=":martial_arts_uniform:" src="/packs/emoji/1f94b.svg" />',
      );
      expect(emojify('🥅')).toEqual(
        '<img draggable="false" class="emojione" alt="🥅" title=":goal_net:" src="/packs/emoji/1f945.svg" />',
      );
      expect(emojify('⛳')).toEqual(
        '<img draggable="false" class="emojione" alt="⛳" title=":golf:" src="/packs/emoji/26f3.svg" />',
      );
      expect(emojify('⛸️')).toEqual(
        '<img draggable="false" class="emojione" alt="⛸️" title=":ice_skate:" src="/packs/emoji/26f8.svg" />',
      );
      expect(emojify('🎣')).toEqual(
        '<img draggable="false" class="emojione" alt="🎣" title=":fishing_pole_and_fish:" src="/packs/emoji/1f3a3.svg" />',
      );
      expect(emojify('🤿')).toEqual(
        '<img draggable="false" class="emojione" alt="🤿" title=":diving_mask:" src="/packs/emoji/1f93f.svg" />',
      );
      expect(emojify('🎽')).toEqual(
        '<img draggable="false" class="emojione" alt="🎽" title=":running_shirt_with_sash:" src="/packs/emoji/1f3bd.svg" />',
      );
      expect(emojify('🎿')).toEqual(
        '<img draggable="false" class="emojione" alt="🎿" title=":ski:" src="/packs/emoji/1f3bf.svg" />',
      );
      expect(emojify('🛷')).toEqual(
        '<img draggable="false" class="emojione" alt="🛷" title=":sled:" src="/packs/emoji/1f6f7.svg" />',
      );
      expect(emojify('🥌')).toEqual(
        '<img draggable="false" class="emojione" alt="🥌" title=":curling_stone:" src="/packs/emoji/1f94c.svg" />',
      );
      expect(emojify('🎯')).toEqual(
        '<img draggable="false" class="emojione" alt="🎯" title=":dart:" src="/packs/emoji/1f3af.svg" />',
      );
      expect(emojify('🪀')).toEqual(
        '<img draggable="false" class="emojione" alt="🪀" title=":yo-yo:" src="/packs/emoji/1fa80.svg" />',
      );
      expect(emojify('🪁')).toEqual(
        '<img draggable="false" class="emojione" alt="🪁" title=":kite:" src="/packs/emoji/1fa81.svg" />',
      );
      expect(emojify('🎱')).toEqual(
        '<img draggable="false" class="emojione" alt="🎱" title=":8ball:" src="/packs/emoji/1f3b1.svg" />',
      );
      expect(emojify('🔮')).toEqual(
        '<img draggable="false" class="emojione" alt="🔮" title=":crystal_ball:" src="/packs/emoji/1f52e.svg" />',
      );
      expect(emojify('🪄')).toEqual(
        '<img draggable="false" class="emojione" alt="🪄" title=":magic_wand:" src="/packs/emoji/1fa84.svg" />',
      );
      expect(emojify('🧿')).toEqual(
        '<img draggable="false" class="emojione" alt="🧿" title=":nazar_amulet:" src="/packs/emoji/1f9ff.svg" />',
      );
      expect(emojify('🪬')).toEqual(
        '<img draggable="false" class="emojione" alt="🪬" title=":hamsa:" src="/packs/emoji/1faac.svg" />',
      );
      expect(emojify('🎮')).toEqual(
        '<img draggable="false" class="emojione" alt="🎮" title=":video_game:" src="/packs/emoji/1f3ae.svg" />',
      );
      expect(emojify('🕹️')).toEqual(
        '<img draggable="false" class="emojione" alt="🕹️" title=":joystick:" src="/packs/emoji/1f579.svg" />',
      );
      expect(emojify('🎰')).toEqual(
        '<img draggable="false" class="emojione" alt="🎰" title=":slot_machine:" src="/packs/emoji/1f3b0.svg" />',
      );
      expect(emojify('🎲')).toEqual(
        '<img draggable="false" class="emojione" alt="🎲" title=":game_die:" src="/packs/emoji/1f3b2.svg" />',
      );
      expect(emojify('🧩')).toEqual(
        '<img draggable="false" class="emojione" alt="🧩" title=":jigsaw:" src="/packs/emoji/1f9e9.svg" />',
      );
      expect(emojify('🧸')).toEqual(
        '<img draggable="false" class="emojione" alt="🧸" title=":teddy_bear:" src="/packs/emoji/1f9f8.svg" />',
      );
      expect(emojify('🪅')).toEqual(
        '<img draggable="false" class="emojione" alt="🪅" title=":pinata:" src="/packs/emoji/1fa85.svg" />',
      );
      expect(emojify('🪩')).toEqual(
        '<img draggable="false" class="emojione" alt="🪩" title=":mirror_ball:" src="/packs/emoji/1faa9.svg" />',
      );
      expect(emojify('🪆')).toEqual(
        '<img draggable="false" class="emojione" alt="🪆" title=":nesting_dolls:" src="/packs/emoji/1fa86.svg" />',
      );
      expect(emojify('♠️')).toEqual(
        '<img draggable="false" class="emojione" alt="♠️" title=":spades:" src="/packs/emoji/2660.svg" />',
      );
      expect(emojify('♥️')).toEqual(
        '<img draggable="false" class="emojione" alt="♥️" title=":hearts:" src="/packs/emoji/2665.svg" />',
      );
      expect(emojify('♦️')).toEqual(
        '<img draggable="false" class="emojione" alt="♦️" title=":diamonds:" src="/packs/emoji/2666.svg" />',
      );
      expect(emojify('♣️')).toEqual(
        '<img draggable="false" class="emojione" alt="♣️" title=":clubs:" src="/packs/emoji/2663.svg" />',
      );
      expect(emojify('♟️')).toEqual(
        '<img draggable="false" class="emojione" alt="♟️" title=":chess_pawn:" src="/packs/emoji/265f.svg" />',
      );
      expect(emojify('🃏')).toEqual(
        '<img draggable="false" class="emojione" alt="🃏" title=":black_joker:" src="/packs/emoji/1f0cf.svg" />',
      );
      expect(emojify('🀄')).toEqual(
        '<img draggable="false" class="emojione" alt="🀄" title=":mahjong:" src="/packs/emoji/1f004.svg" />',
      );
      expect(emojify('🎴')).toEqual(
        '<img draggable="false" class="emojione" alt="🎴" title=":flower_playing_cards:" src="/packs/emoji/1f3b4.svg" />',
      );
      expect(emojify('🎭')).toEqual(
        '<img draggable="false" class="emojione" alt="🎭" title=":performing_arts:" src="/packs/emoji/1f3ad.svg" />',
      );
      expect(emojify('🖼️')).toEqual(
        '<img draggable="false" class="emojione" alt="🖼️" title=":frame_with_picture:" src="/packs/emoji/1f5bc.svg" />',
      );
      expect(emojify('🎨')).toEqual(
        '<img draggable="false" class="emojione" alt="🎨" title=":art:" src="/packs/emoji/1f3a8.svg" />',
      );
      expect(emojify('🧵')).toEqual(
        '<img draggable="false" class="emojione" alt="🧵" title=":thread:" src="/packs/emoji/1f9f5.svg" />',
      );
      expect(emojify('🪡')).toEqual(
        '<img draggable="false" class="emojione" alt="🪡" title=":sewing_needle:" src="/packs/emoji/1faa1.svg" />',
      );
      expect(emojify('🧶')).toEqual(
        '<img draggable="false" class="emojione" alt="🧶" title=":yarn:" src="/packs/emoji/1f9f6.svg" />',
      );
      expect(emojify('🪢')).toEqual(
        '<img draggable="false" class="emojione" alt="🪢" title=":knot:" src="/packs/emoji/1faa2.svg" />',
      );
      expect(emojify('👓')).toEqual(
        '<img draggable="false" class="emojione" alt="👓" title=":eyeglasses:" src="/packs/emoji/1f453.svg" />',
      );
      expect(emojify('🕶️')).toEqual(
        '<img draggable="false" class="emojione" alt="🕶️" title=":dark_sunglasses:" src="/packs/emoji/1f576.svg" />',
      );
      expect(emojify('🥽')).toEqual(
        '<img draggable="false" class="emojione" alt="🥽" title=":goggles:" src="/packs/emoji/1f97d.svg" />',
      );
      expect(emojify('🥼')).toEqual(
        '<img draggable="false" class="emojione" alt="🥼" title=":lab_coat:" src="/packs/emoji/1f97c.svg" />',
      );
      expect(emojify('🦺')).toEqual(
        '<img draggable="false" class="emojione" alt="🦺" title=":safety_vest:" src="/packs/emoji/1f9ba.svg" />',
      );
      expect(emojify('👔')).toEqual(
        '<img draggable="false" class="emojione" alt="👔" title=":necktie:" src="/packs/emoji/1f454.svg" />',
      );
      expect(emojify('👕')).toEqual(
        '<img draggable="false" class="emojione" alt="👕" title=":shirt:" src="/packs/emoji/1f455.svg" />',
      );
      expect(emojify('👖')).toEqual(
        '<img draggable="false" class="emojione" alt="👖" title=":jeans:" src="/packs/emoji/1f456.svg" />',
      );
      expect(emojify('🧣')).toEqual(
        '<img draggable="false" class="emojione" alt="🧣" title=":scarf:" src="/packs/emoji/1f9e3.svg" />',
      );
      expect(emojify('🧤')).toEqual(
        '<img draggable="false" class="emojione" alt="🧤" title=":gloves:" src="/packs/emoji/1f9e4.svg" />',
      );
      expect(emojify('🧥')).toEqual(
        '<img draggable="false" class="emojione" alt="🧥" title=":coat:" src="/packs/emoji/1f9e5.svg" />',
      );
      expect(emojify('🧦')).toEqual(
        '<img draggable="false" class="emojione" alt="🧦" title=":socks:" src="/packs/emoji/1f9e6.svg" />',
      );
      expect(emojify('👗')).toEqual(
        '<img draggable="false" class="emojione" alt="👗" title=":dress:" src="/packs/emoji/1f457.svg" />',
      );
      expect(emojify('👘')).toEqual(
        '<img draggable="false" class="emojione" alt="👘" title=":kimono:" src="/packs/emoji/1f458.svg" />',
      );
      expect(emojify('🥻')).toEqual(
        '<img draggable="false" class="emojione" alt="🥻" title=":sari:" src="/packs/emoji/1f97b.svg" />',
      );
      expect(emojify('🩱')).toEqual(
        '<img draggable="false" class="emojione" alt="🩱" title=":one-piece_swimsuit:" src="/packs/emoji/1fa71.svg" />',
      );
      expect(emojify('🩲')).toEqual(
        '<img draggable="false" class="emojione" alt="🩲" title=":briefs:" src="/packs/emoji/1fa72.svg" />',
      );
      expect(emojify('🩳')).toEqual(
        '<img draggable="false" class="emojione" alt="🩳" title=":shorts:" src="/packs/emoji/1fa73.svg" />',
      );
      expect(emojify('👙')).toEqual(
        '<img draggable="false" class="emojione" alt="👙" title=":bikini:" src="/packs/emoji/1f459.svg" />',
      );
      expect(emojify('👚')).toEqual(
        '<img draggable="false" class="emojione" alt="👚" title=":womans_clothes:" src="/packs/emoji/1f45a.svg" />',
      );
      expect(emojify('👛')).toEqual(
        '<img draggable="false" class="emojione" alt="👛" title=":purse:" src="/packs/emoji/1f45b.svg" />',
      );
      expect(emojify('👜')).toEqual(
        '<img draggable="false" class="emojione" alt="👜" title=":handbag:" src="/packs/emoji/1f45c.svg" />',
      );
      expect(emojify('👝')).toEqual(
        '<img draggable="false" class="emojione" alt="👝" title=":pouch:" src="/packs/emoji/1f45d.svg" />',
      );
      expect(emojify('🛍️')).toEqual(
        '<img draggable="false" class="emojione" alt="🛍️" title=":shopping_bags:" src="/packs/emoji/1f6cd.svg" />',
      );
      expect(emojify('🎒')).toEqual(
        '<img draggable="false" class="emojione" alt="🎒" title=":school_satchel:" src="/packs/emoji/1f392.svg" />',
      );
      expect(emojify('🩴')).toEqual(
        '<img draggable="false" class="emojione" alt="🩴" title=":thong_sandal:" src="/packs/emoji/1fa74.svg" />',
      );
      expect(emojify('👞')).toEqual(
        '<img draggable="false" class="emojione" alt="👞" title=":mans_shoe:" src="/packs/emoji/1f45e.svg" />',
      );
      expect(emojify('👟')).toEqual(
        '<img draggable="false" class="emojione" alt="👟" title=":athletic_shoe:" src="/packs/emoji/1f45f.svg" />',
      );
      expect(emojify('🥾')).toEqual(
        '<img draggable="false" class="emojione" alt="🥾" title=":hiking_boot:" src="/packs/emoji/1f97e.svg" />',
      );
      expect(emojify('🥿')).toEqual(
        '<img draggable="false" class="emojione" alt="🥿" title=":womans_flat_shoe:" src="/packs/emoji/1f97f.svg" />',
      );
      expect(emojify('👠')).toEqual(
        '<img draggable="false" class="emojione" alt="👠" title=":high_heel:" src="/packs/emoji/1f460.svg" />',
      );
      expect(emojify('👡')).toEqual(
        '<img draggable="false" class="emojione" alt="👡" title=":sandal:" src="/packs/emoji/1f461.svg" />',
      );
      expect(emojify('🩰')).toEqual(
        '<img draggable="false" class="emojione" alt="🩰" title=":ballet_shoes:" src="/packs/emoji/1fa70.svg" />',
      );
      expect(emojify('👢')).toEqual(
        '<img draggable="false" class="emojione" alt="👢" title=":boot:" src="/packs/emoji/1f462.svg" />',
      );
      expect(emojify('👑')).toEqual(
        '<img draggable="false" class="emojione" alt="👑" title=":crown:" src="/packs/emoji/1f451.svg" />',
      );
      expect(emojify('👒')).toEqual(
        '<img draggable="false" class="emojione" alt="👒" title=":womans_hat:" src="/packs/emoji/1f452.svg" />',
      );
      expect(emojify('🎩')).toEqual(
        '<img draggable="false" class="emojione" alt="🎩" title=":tophat:" src="/packs/emoji/1f3a9.svg" />',
      );
      expect(emojify('🎓')).toEqual(
        '<img draggable="false" class="emojione" alt="🎓" title=":mortar_board:" src="/packs/emoji/1f393.svg" />',
      );
      expect(emojify('🧢')).toEqual(
        '<img draggable="false" class="emojione" alt="🧢" title=":billed_cap:" src="/packs/emoji/1f9e2.svg" />',
      );
      expect(emojify('🪖')).toEqual(
        '<img draggable="false" class="emojione" alt="🪖" title=":military_helmet:" src="/packs/emoji/1fa96.svg" />',
      );
      expect(emojify('⛑️')).toEqual(
        '<img draggable="false" class="emojione" alt="⛑️" title=":helmet_with_white_cross:" src="/packs/emoji/26d1.svg" />',
      );
      expect(emojify('📿')).toEqual(
        '<img draggable="false" class="emojione" alt="📿" title=":prayer_beads:" src="/packs/emoji/1f4ff.svg" />',
      );
      expect(emojify('💄')).toEqual(
        '<img draggable="false" class="emojione" alt="💄" title=":lipstick:" src="/packs/emoji/1f484.svg" />',
      );
      expect(emojify('💍')).toEqual(
        '<img draggable="false" class="emojione" alt="💍" title=":ring:" src="/packs/emoji/1f48d.svg" />',
      );
      expect(emojify('💎')).toEqual(
        '<img draggable="false" class="emojione" alt="💎" title=":gem:" src="/packs/emoji/1f48e.svg" />',
      );
      expect(emojify('🔇')).toEqual(
        '<img draggable="false" class="emojione" alt="🔇" title=":mute:" src="/packs/emoji/1f507.svg" />',
      );
      expect(emojify('🔈')).toEqual(
        '<img draggable="false" class="emojione" alt="🔈" title=":speaker:" src="/packs/emoji/1f508.svg" />',
      );
      expect(emojify('🔉')).toEqual(
        '<img draggable="false" class="emojione" alt="🔉" title=":sound:" src="/packs/emoji/1f509.svg" />',
      );
      expect(emojify('🔊')).toEqual(
        '<img draggable="false" class="emojione" alt="🔊" title=":loud_sound:" src="/packs/emoji/1f50a.svg" />',
      );
      expect(emojify('📢')).toEqual(
        '<img draggable="false" class="emojione" alt="📢" title=":loudspeaker:" src="/packs/emoji/1f4e2.svg" />',
      );
      expect(emojify('📣')).toEqual(
        '<img draggable="false" class="emojione" alt="📣" title=":mega:" src="/packs/emoji/1f4e3.svg" />',
      );
      expect(emojify('📯')).toEqual(
        '<img draggable="false" class="emojione" alt="📯" title=":postal_horn:" src="/packs/emoji/1f4ef.svg" />',
      );
      expect(emojify('🔔')).toEqual(
        '<img draggable="false" class="emojione" alt="🔔" title=":bell:" src="/packs/emoji/1f514.svg" />',
      );
      expect(emojify('🔕')).toEqual(
        '<img draggable="false" class="emojione" alt="🔕" title=":no_bell:" src="/packs/emoji/1f515.svg" />',
      );
      expect(emojify('🎼')).toEqual(
        '<img draggable="false" class="emojione" alt="🎼" title=":musical_score:" src="/packs/emoji/1f3bc.svg" />',
      );
      expect(emojify('🎵')).toEqual(
        '<img draggable="false" class="emojione" alt="🎵" title=":musical_note:" src="/packs/emoji/1f3b5.svg" />',
      );
      expect(emojify('🎶')).toEqual(
        '<img draggable="false" class="emojione" alt="🎶" title=":notes:" src="/packs/emoji/1f3b6.svg" />',
      );
      expect(emojify('🎙️')).toEqual(
        '<img draggable="false" class="emojione" alt="🎙️" title=":studio_microphone:" src="/packs/emoji/1f399.svg" />',
      );
      expect(emojify('🎚️')).toEqual(
        '<img draggable="false" class="emojione" alt="🎚️" title=":level_slider:" src="/packs/emoji/1f39a.svg" />',
      );
      expect(emojify('🎛️')).toEqual(
        '<img draggable="false" class="emojione" alt="🎛️" title=":control_knobs:" src="/packs/emoji/1f39b.svg" />',
      );
      expect(emojify('🎤')).toEqual(
        '<img draggable="false" class="emojione" alt="🎤" title=":microphone:" src="/packs/emoji/1f3a4.svg" />',
      );
      expect(emojify('🎧')).toEqual(
        '<img draggable="false" class="emojione" alt="🎧" title=":headphones:" src="/packs/emoji/1f3a7.svg" />',
      );
      expect(emojify('📻')).toEqual(
        '<img draggable="false" class="emojione" alt="📻" title=":radio:" src="/packs/emoji/1f4fb.svg" />',
      );
      expect(emojify('🎷')).toEqual(
        '<img draggable="false" class="emojione" alt="🎷" title=":saxophone:" src="/packs/emoji/1f3b7.svg" />',
      );
      expect(emojify('🪗')).toEqual(
        '<img draggable="false" class="emojione" alt="🪗" title=":accordion:" src="/packs/emoji/1fa97.svg" />',
      );
      expect(emojify('🎸')).toEqual(
        '<img draggable="false" class="emojione" alt="🎸" title=":guitar:" src="/packs/emoji/1f3b8.svg" />',
      );
      expect(emojify('🎹')).toEqual(
        '<img draggable="false" class="emojione" alt="🎹" title=":musical_keyboard:" src="/packs/emoji/1f3b9.svg" />',
      );
      expect(emojify('🎺')).toEqual(
        '<img draggable="false" class="emojione" alt="🎺" title=":trumpet:" src="/packs/emoji/1f3ba.svg" />',
      );
      expect(emojify('🎻')).toEqual(
        '<img draggable="false" class="emojione" alt="🎻" title=":violin:" src="/packs/emoji/1f3bb.svg" />',
      );
      expect(emojify('🪕')).toEqual(
        '<img draggable="false" class="emojione" alt="🪕" title=":banjo:" src="/packs/emoji/1fa95.svg" />',
      );
      expect(emojify('🥁')).toEqual(
        '<img draggable="false" class="emojione" alt="🥁" title=":drum_with_drumsticks:" src="/packs/emoji/1f941.svg" />',
      );
      expect(emojify('🪘')).toEqual(
        '<img draggable="false" class="emojione" alt="🪘" title=":long_drum:" src="/packs/emoji/1fa98.svg" />',
      );
      expect(emojify('📱')).toEqual(
        '<img draggable="false" class="emojione" alt="📱" title=":iphone:" src="/packs/emoji/1f4f1.svg" />',
      );
      expect(emojify('📲')).toEqual(
        '<img draggable="false" class="emojione" alt="📲" title=":calling:" src="/packs/emoji/1f4f2.svg" />',
      );
      expect(emojify('☎️')).toEqual(
        '<img draggable="false" class="emojione" alt="☎️" title=":phone:" src="/packs/emoji/260e.svg" />',
      );
      expect(emojify('📞')).toEqual(
        '<img draggable="false" class="emojione" alt="📞" title=":telephone_receiver:" src="/packs/emoji/1f4de.svg" />',
      );
      expect(emojify('📟')).toEqual(
        '<img draggable="false" class="emojione" alt="📟" title=":pager:" src="/packs/emoji/1f4df.svg" />',
      );
      expect(emojify('📠')).toEqual(
        '<img draggable="false" class="emojione" alt="📠" title=":fax:" src="/packs/emoji/1f4e0.svg" />',
      );
      expect(emojify('🔋')).toEqual(
        '<img draggable="false" class="emojione" alt="🔋" title=":battery:" src="/packs/emoji/1f50b.svg" />',
      );
      expect(emojify('🪫')).toEqual(
        '<img draggable="false" class="emojione" alt="🪫" title=":low_battery:" src="/packs/emoji/1faab.svg" />',
      );
      expect(emojify('🔌')).toEqual(
        '<img draggable="false" class="emojione" alt="🔌" title=":electric_plug:" src="/packs/emoji/1f50c.svg" />',
      );
      expect(emojify('💻')).toEqual(
        '<img draggable="false" class="emojione" alt="💻" title=":computer:" src="/packs/emoji/1f4bb.svg" />',
      );
      expect(emojify('🖥️')).toEqual(
        '<img draggable="false" class="emojione" alt="🖥️" title=":desktop_computer:" src="/packs/emoji/1f5a5.svg" />',
      );
      expect(emojify('🖨️')).toEqual(
        '<img draggable="false" class="emojione" alt="🖨️" title=":printer:" src="/packs/emoji/1f5a8.svg" />',
      );
      expect(emojify('⌨️')).toEqual(
        '<img draggable="false" class="emojione" alt="⌨️" title=":keyboard:" src="/packs/emoji/2328.svg" />',
      );
      expect(emojify('🖱️')).toEqual(
        '<img draggable="false" class="emojione" alt="🖱️" title=":three_button_mouse:" src="/packs/emoji/1f5b1.svg" />',
      );
      expect(emojify('🖲️')).toEqual(
        '<img draggable="false" class="emojione" alt="🖲️" title=":trackball:" src="/packs/emoji/1f5b2.svg" />',
      );
      expect(emojify('💽')).toEqual(
        '<img draggable="false" class="emojione" alt="💽" title=":minidisc:" src="/packs/emoji/1f4bd.svg" />',
      );
      expect(emojify('💾')).toEqual(
        '<img draggable="false" class="emojione" alt="💾" title=":floppy_disk:" src="/packs/emoji/1f4be.svg" />',
      );
      expect(emojify('💿')).toEqual(
        '<img draggable="false" class="emojione" alt="💿" title=":cd:" src="/packs/emoji/1f4bf.svg" />',
      );
      expect(emojify('📀')).toEqual(
        '<img draggable="false" class="emojione" alt="📀" title=":dvd:" src="/packs/emoji/1f4c0.svg" />',
      );
      expect(emojify('🧮')).toEqual(
        '<img draggable="false" class="emojione" alt="🧮" title=":abacus:" src="/packs/emoji/1f9ee.svg" />',
      );
      expect(emojify('🎥')).toEqual(
        '<img draggable="false" class="emojione" alt="🎥" title=":movie_camera:" src="/packs/emoji/1f3a5.svg" />',
      );
      expect(emojify('🎞️')).toEqual(
        '<img draggable="false" class="emojione" alt="🎞️" title=":film_frames:" src="/packs/emoji/1f39e.svg" />',
      );
      expect(emojify('📽️')).toEqual(
        '<img draggable="false" class="emojione" alt="📽️" title=":film_projector:" src="/packs/emoji/1f4fd.svg" />',
      );
      expect(emojify('🎬')).toEqual(
        '<img draggable="false" class="emojione" alt="🎬" title=":clapper:" src="/packs/emoji/1f3ac.svg" />',
      );
      expect(emojify('📺')).toEqual(
        '<img draggable="false" class="emojione" alt="📺" title=":tv:" src="/packs/emoji/1f4fa.svg" />',
      );
      expect(emojify('📷')).toEqual(
        '<img draggable="false" class="emojione" alt="📷" title=":camera:" src="/packs/emoji/1f4f7.svg" />',
      );
      expect(emojify('📸')).toEqual(
        '<img draggable="false" class="emojione" alt="📸" title=":camera_with_flash:" src="/packs/emoji/1f4f8.svg" />',
      );
      expect(emojify('📹')).toEqual(
        '<img draggable="false" class="emojione" alt="📹" title=":video_camera:" src="/packs/emoji/1f4f9.svg" />',
      );
      expect(emojify('📼')).toEqual(
        '<img draggable="false" class="emojione" alt="📼" title=":vhs:" src="/packs/emoji/1f4fc.svg" />',
      );
      expect(emojify('🔍')).toEqual(
        '<img draggable="false" class="emojione" alt="🔍" title=":mag:" src="/packs/emoji/1f50d.svg" />',
      );
      expect(emojify('🔎')).toEqual(
        '<img draggable="false" class="emojione" alt="🔎" title=":mag_right:" src="/packs/emoji/1f50e.svg" />',
      );
      expect(emojify('🕯️')).toEqual(
        '<img draggable="false" class="emojione" alt="🕯️" title=":candle:" src="/packs/emoji/1f56f.svg" />',
      );
      expect(emojify('💡')).toEqual(
        '<img draggable="false" class="emojione" alt="💡" title=":bulb:" src="/packs/emoji/1f4a1.svg" />',
      );
      expect(emojify('🔦')).toEqual(
        '<img draggable="false" class="emojione" alt="🔦" title=":flashlight:" src="/packs/emoji/1f526.svg" />',
      );
      expect(emojify('🏮')).toEqual(
        '<img draggable="false" class="emojione" alt="🏮" title=":izakaya_lantern:" src="/packs/emoji/1f3ee.svg" />',
      );
      expect(emojify('🪔')).toEqual(
        '<img draggable="false" class="emojione" alt="🪔" title=":diya_lamp:" src="/packs/emoji/1fa94.svg" />',
      );
      expect(emojify('📔')).toEqual(
        '<img draggable="false" class="emojione" alt="📔" title=":notebook_with_decorative_cover:" src="/packs/emoji/1f4d4.svg" />',
      );
      expect(emojify('📕')).toEqual(
        '<img draggable="false" class="emojione" alt="📕" title=":closed_book:" src="/packs/emoji/1f4d5.svg" />',
      );
      expect(emojify('📖')).toEqual(
        '<img draggable="false" class="emojione" alt="📖" title=":book:" src="/packs/emoji/1f4d6.svg" />',
      );
      expect(emojify('📗')).toEqual(
        '<img draggable="false" class="emojione" alt="📗" title=":green_book:" src="/packs/emoji/1f4d7.svg" />',
      );
      expect(emojify('📘')).toEqual(
        '<img draggable="false" class="emojione" alt="📘" title=":blue_book:" src="/packs/emoji/1f4d8.svg" />',
      );
      expect(emojify('📙')).toEqual(
        '<img draggable="false" class="emojione" alt="📙" title=":orange_book:" src="/packs/emoji/1f4d9.svg" />',
      );
      expect(emojify('📚')).toEqual(
        '<img draggable="false" class="emojione" alt="📚" title=":books:" src="/packs/emoji/1f4da.svg" />',
      );
      expect(emojify('📓')).toEqual(
        '<img draggable="false" class="emojione" alt="📓" title=":notebook:" src="/packs/emoji/1f4d3.svg" />',
      );
      expect(emojify('📒')).toEqual(
        '<img draggable="false" class="emojione" alt="📒" title=":ledger:" src="/packs/emoji/1f4d2.svg" />',
      );
      expect(emojify('📃')).toEqual(
        '<img draggable="false" class="emojione" alt="📃" title=":page_with_curl:" src="/packs/emoji/1f4c3.svg" />',
      );
      expect(emojify('📜')).toEqual(
        '<img draggable="false" class="emojione" alt="📜" title=":scroll:" src="/packs/emoji/1f4dc.svg" />',
      );
      expect(emojify('📄')).toEqual(
        '<img draggable="false" class="emojione" alt="📄" title=":page_facing_up:" src="/packs/emoji/1f4c4.svg" />',
      );
      expect(emojify('📰')).toEqual(
        '<img draggable="false" class="emojione" alt="📰" title=":newspaper:" src="/packs/emoji/1f4f0.svg" />',
      );
      expect(emojify('🗞️')).toEqual(
        '<img draggable="false" class="emojione" alt="🗞️" title=":rolled_up_newspaper:" src="/packs/emoji/1f5de.svg" />',
      );
      expect(emojify('📑')).toEqual(
        '<img draggable="false" class="emojione" alt="📑" title=":bookmark_tabs:" src="/packs/emoji/1f4d1.svg" />',
      );
      expect(emojify('🔖')).toEqual(
        '<img draggable="false" class="emojione" alt="🔖" title=":bookmark:" src="/packs/emoji/1f516.svg" />',
      );
      expect(emojify('🏷️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏷️" title=":label:" src="/packs/emoji/1f3f7.svg" />',
      );
      expect(emojify('💰')).toEqual(
        '<img draggable="false" class="emojione" alt="💰" title=":moneybag:" src="/packs/emoji/1f4b0.svg" />',
      );
      expect(emojify('🪙')).toEqual(
        '<img draggable="false" class="emojione" alt="🪙" title=":coin:" src="/packs/emoji/1fa99.svg" />',
      );
      expect(emojify('💴')).toEqual(
        '<img draggable="false" class="emojione" alt="💴" title=":yen:" src="/packs/emoji/1f4b4.svg" />',
      );
      expect(emojify('💵')).toEqual(
        '<img draggable="false" class="emojione" alt="💵" title=":dollar:" src="/packs/emoji/1f4b5.svg" />',
      );
      expect(emojify('💶')).toEqual(
        '<img draggable="false" class="emojione" alt="💶" title=":euro:" src="/packs/emoji/1f4b6.svg" />',
      );
      expect(emojify('💷')).toEqual(
        '<img draggable="false" class="emojione" alt="💷" title=":pound:" src="/packs/emoji/1f4b7.svg" />',
      );
      expect(emojify('💸')).toEqual(
        '<img draggable="false" class="emojione" alt="💸" title=":money_with_wings:" src="/packs/emoji/1f4b8.svg" />',
      );
      expect(emojify('💳')).toEqual(
        '<img draggable="false" class="emojione" alt="💳" title=":credit_card:" src="/packs/emoji/1f4b3.svg" />',
      );
      expect(emojify('🧾')).toEqual(
        '<img draggable="false" class="emojione" alt="🧾" title=":receipt:" src="/packs/emoji/1f9fe.svg" />',
      );
      expect(emojify('💹')).toEqual(
        '<img draggable="false" class="emojione" alt="💹" title=":chart:" src="/packs/emoji/1f4b9.svg" />',
      );
      expect(emojify('✉️')).toEqual(
        '<img draggable="false" class="emojione" alt="✉️" title=":email:" src="/packs/emoji/2709.svg" />',
      );
      expect(emojify('📧')).toEqual(
        '<img draggable="false" class="emojione" alt="📧" title=":e-mail:" src="/packs/emoji/1f4e7.svg" />',
      );
      expect(emojify('📨')).toEqual(
        '<img draggable="false" class="emojione" alt="📨" title=":incoming_envelope:" src="/packs/emoji/1f4e8.svg" />',
      );
      expect(emojify('📩')).toEqual(
        '<img draggable="false" class="emojione" alt="📩" title=":envelope_with_arrow:" src="/packs/emoji/1f4e9.svg" />',
      );
      expect(emojify('📤')).toEqual(
        '<img draggable="false" class="emojione" alt="📤" title=":outbox_tray:" src="/packs/emoji/1f4e4.svg" />',
      );
      expect(emojify('📥')).toEqual(
        '<img draggable="false" class="emojione" alt="📥" title=":inbox_tray:" src="/packs/emoji/1f4e5.svg" />',
      );
      expect(emojify('📦')).toEqual(
        '<img draggable="false" class="emojione" alt="📦" title=":package:" src="/packs/emoji/1f4e6.svg" />',
      );
      expect(emojify('📫')).toEqual(
        '<img draggable="false" class="emojione" alt="📫" title=":mailbox:" src="/packs/emoji/1f4eb.svg" />',
      );
      expect(emojify('📪')).toEqual(
        '<img draggable="false" class="emojione" alt="📪" title=":mailbox_closed:" src="/packs/emoji/1f4ea.svg" />',
      );
      expect(emojify('📬')).toEqual(
        '<img draggable="false" class="emojione" alt="📬" title=":mailbox_with_mail:" src="/packs/emoji/1f4ec.svg" />',
      );
      expect(emojify('📭')).toEqual(
        '<img draggable="false" class="emojione" alt="📭" title=":mailbox_with_no_mail:" src="/packs/emoji/1f4ed.svg" />',
      );
      expect(emojify('📮')).toEqual(
        '<img draggable="false" class="emojione" alt="📮" title=":postbox:" src="/packs/emoji/1f4ee.svg" />',
      );
      expect(emojify('🗳️')).toEqual(
        '<img draggable="false" class="emojione" alt="🗳️" title=":ballot_box_with_ballot:" src="/packs/emoji/1f5f3.svg" />',
      );
      expect(emojify('✏️')).toEqual(
        '<img draggable="false" class="emojione" alt="✏️" title=":pencil2:" src="/packs/emoji/270f.svg" />',
      );
      expect(emojify('✒️')).toEqual(
        '<img draggable="false" class="emojione" alt="✒️" title=":black_nib:" src="/packs/emoji/2712.svg" />',
      );
      expect(emojify('🖋️')).toEqual(
        '<img draggable="false" class="emojione" alt="🖋️" title=":lower_left_fountain_pen:" src="/packs/emoji/1f58b.svg" />',
      );
      expect(emojify('🖊️')).toEqual(
        '<img draggable="false" class="emojione" alt="🖊️" title=":lower_left_ballpoint_pen:" src="/packs/emoji/1f58a.svg" />',
      );
      expect(emojify('🖌️')).toEqual(
        '<img draggable="false" class="emojione" alt="🖌️" title=":lower_left_paintbrush:" src="/packs/emoji/1f58c.svg" />',
      );
      expect(emojify('🖍️')).toEqual(
        '<img draggable="false" class="emojione" alt="🖍️" title=":lower_left_crayon:" src="/packs/emoji/1f58d.svg" />',
      );
      expect(emojify('📝')).toEqual(
        '<img draggable="false" class="emojione" alt="📝" title=":memo:" src="/packs/emoji/1f4dd.svg" />',
      );
      expect(emojify('💼')).toEqual(
        '<img draggable="false" class="emojione" alt="💼" title=":briefcase:" src="/packs/emoji/1f4bc.svg" />',
      );
      expect(emojify('📁')).toEqual(
        '<img draggable="false" class="emojione" alt="📁" title=":file_folder:" src="/packs/emoji/1f4c1.svg" />',
      );
      expect(emojify('📂')).toEqual(
        '<img draggable="false" class="emojione" alt="📂" title=":open_file_folder:" src="/packs/emoji/1f4c2.svg" />',
      );
      expect(emojify('🗂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🗂️" title=":card_index_dividers:" src="/packs/emoji/1f5c2.svg" />',
      );
      expect(emojify('📅')).toEqual(
        '<img draggable="false" class="emojione" alt="📅" title=":date:" src="/packs/emoji/1f4c5.svg" />',
      );
      expect(emojify('📆')).toEqual(
        '<img draggable="false" class="emojione" alt="📆" title=":calendar:" src="/packs/emoji/1f4c6.svg" />',
      );
      expect(emojify('🗒️')).toEqual(
        '<img draggable="false" class="emojione" alt="🗒️" title=":spiral_note_pad:" src="/packs/emoji/1f5d2.svg" />',
      );
      expect(emojify('🗓️')).toEqual(
        '<img draggable="false" class="emojione" alt="🗓️" title=":spiral_calendar_pad:" src="/packs/emoji/1f5d3.svg" />',
      );
      expect(emojify('📇')).toEqual(
        '<img draggable="false" class="emojione" alt="📇" title=":card_index:" src="/packs/emoji/1f4c7.svg" />',
      );
      expect(emojify('📈')).toEqual(
        '<img draggable="false" class="emojione" alt="📈" title=":chart_with_upwards_trend:" src="/packs/emoji/1f4c8.svg" />',
      );
      expect(emojify('📉')).toEqual(
        '<img draggable="false" class="emojione" alt="📉" title=":chart_with_downwards_trend:" src="/packs/emoji/1f4c9.svg" />',
      );
      expect(emojify('📊')).toEqual(
        '<img draggable="false" class="emojione" alt="📊" title=":bar_chart:" src="/packs/emoji/1f4ca.svg" />',
      );
      expect(emojify('📋')).toEqual(
        '<img draggable="false" class="emojione" alt="📋" title=":clipboard:" src="/packs/emoji/1f4cb.svg" />',
      );
      expect(emojify('📌')).toEqual(
        '<img draggable="false" class="emojione" alt="📌" title=":pushpin:" src="/packs/emoji/1f4cc.svg" />',
      );
      expect(emojify('📍')).toEqual(
        '<img draggable="false" class="emojione" alt="📍" title=":round_pushpin:" src="/packs/emoji/1f4cd.svg" />',
      );
      expect(emojify('📎')).toEqual(
        '<img draggable="false" class="emojione" alt="📎" title=":paperclip:" src="/packs/emoji/1f4ce.svg" />',
      );
      expect(emojify('🖇️')).toEqual(
        '<img draggable="false" class="emojione" alt="🖇️" title=":linked_paperclips:" src="/packs/emoji/1f587.svg" />',
      );
      expect(emojify('📏')).toEqual(
        '<img draggable="false" class="emojione" alt="📏" title=":straight_ruler:" src="/packs/emoji/1f4cf.svg" />',
      );
      expect(emojify('📐')).toEqual(
        '<img draggable="false" class="emojione" alt="📐" title=":triangular_ruler:" src="/packs/emoji/1f4d0.svg" />',
      );
      expect(emojify('✂️')).toEqual(
        '<img draggable="false" class="emojione" alt="✂️" title=":scissors:" src="/packs/emoji/2702.svg" />',
      );
      expect(emojify('🗃️')).toEqual(
        '<img draggable="false" class="emojione" alt="🗃️" title=":card_file_box:" src="/packs/emoji/1f5c3.svg" />',
      );
      expect(emojify('🗄️')).toEqual(
        '<img draggable="false" class="emojione" alt="🗄️" title=":file_cabinet:" src="/packs/emoji/1f5c4.svg" />',
      );
      expect(emojify('🗑️')).toEqual(
        '<img draggable="false" class="emojione" alt="🗑️" title=":wastebasket:" src="/packs/emoji/1f5d1.svg" />',
      );
      expect(emojify('🔒')).toEqual(
        '<img draggable="false" class="emojione" alt="🔒" title=":lock:" src="/packs/emoji/1f512.svg" />',
      );
      expect(emojify('🔓')).toEqual(
        '<img draggable="false" class="emojione" alt="🔓" title=":unlock:" src="/packs/emoji/1f513.svg" />',
      );
      expect(emojify('🔏')).toEqual(
        '<img draggable="false" class="emojione" alt="🔏" title=":lock_with_ink_pen:" src="/packs/emoji/1f50f.svg" />',
      );
      expect(emojify('🔐')).toEqual(
        '<img draggable="false" class="emojione" alt="🔐" title=":closed_lock_with_key:" src="/packs/emoji/1f510.svg" />',
      );
      expect(emojify('🔑')).toEqual(
        '<img draggable="false" class="emojione" alt="🔑" title=":key:" src="/packs/emoji/1f511.svg" />',
      );
      expect(emojify('🗝️')).toEqual(
        '<img draggable="false" class="emojione" alt="🗝️" title=":old_key:" src="/packs/emoji/1f5dd.svg" />',
      );
      expect(emojify('🔨')).toEqual(
        '<img draggable="false" class="emojione" alt="🔨" title=":hammer:" src="/packs/emoji/1f528.svg" />',
      );
      expect(emojify('🪓')).toEqual(
        '<img draggable="false" class="emojione" alt="🪓" title=":axe:" src="/packs/emoji/1fa93.svg" />',
      );
      expect(emojify('⛏️')).toEqual(
        '<img draggable="false" class="emojione" alt="⛏️" title=":pick:" src="/packs/emoji/26cf.svg" />',
      );
      expect(emojify('⚒️')).toEqual(
        '<img draggable="false" class="emojione" alt="⚒️" title=":hammer_and_pick:" src="/packs/emoji/2692.svg" />',
      );
      expect(emojify('🛠️')).toEqual(
        '<img draggable="false" class="emojione" alt="🛠️" title=":hammer_and_wrench:" src="/packs/emoji/1f6e0.svg" />',
      );
      expect(emojify('🗡️')).toEqual(
        '<img draggable="false" class="emojione" alt="🗡️" title=":dagger_knife:" src="/packs/emoji/1f5e1.svg" />',
      );
      expect(emojify('⚔️')).toEqual(
        '<img draggable="false" class="emojione" alt="⚔️" title=":crossed_swords:" src="/packs/emoji/2694.svg" />',
      );
      expect(emojify('🔫')).toEqual(
        '<img draggable="false" class="emojione" alt="🔫" title=":gun:" src="/packs/emoji/1f52b.svg" />',
      );
      expect(emojify('🪃')).toEqual(
        '<img draggable="false" class="emojione" alt="🪃" title=":boomerang:" src="/packs/emoji/1fa83.svg" />',
      );
      expect(emojify('🏹')).toEqual(
        '<img draggable="false" class="emojione" alt="🏹" title=":bow_and_arrow:" src="/packs/emoji/1f3f9.svg" />',
      );
      expect(emojify('🛡️')).toEqual(
        '<img draggable="false" class="emojione" alt="🛡️" title=":shield:" src="/packs/emoji/1f6e1.svg" />',
      );
      expect(emojify('🪚')).toEqual(
        '<img draggable="false" class="emojione" alt="🪚" title=":carpentry_saw:" src="/packs/emoji/1fa9a.svg" />',
      );
      expect(emojify('🔧')).toEqual(
        '<img draggable="false" class="emojione" alt="🔧" title=":wrench:" src="/packs/emoji/1f527.svg" />',
      );
      expect(emojify('🪛')).toEqual(
        '<img draggable="false" class="emojione" alt="🪛" title=":screwdriver:" src="/packs/emoji/1fa9b.svg" />',
      );
      expect(emojify('🔩')).toEqual(
        '<img draggable="false" class="emojione" alt="🔩" title=":nut_and_bolt:" src="/packs/emoji/1f529.svg" />',
      );
      expect(emojify('⚙️')).toEqual(
        '<img draggable="false" class="emojione" alt="⚙️" title=":gear:" src="/packs/emoji/2699.svg" />',
      );
      expect(emojify('🗜️')).toEqual(
        '<img draggable="false" class="emojione" alt="🗜️" title=":compression:" src="/packs/emoji/1f5dc.svg" />',
      );
      expect(emojify('⚖️')).toEqual(
        '<img draggable="false" class="emojione" alt="⚖️" title=":scales:" src="/packs/emoji/2696.svg" />',
      );
      expect(emojify('🦯')).toEqual(
        '<img draggable="false" class="emojione" alt="🦯" title=":probing_cane:" src="/packs/emoji/1f9af.svg" />',
      );
      expect(emojify('🔗')).toEqual(
        '<img draggable="false" class="emojione" alt="🔗" title=":link:" src="/packs/emoji/1f517.svg" />',
      );
      expect(emojify('⛓️')).toEqual(
        '<img draggable="false" class="emojione" alt="⛓️" title=":chains:" src="/packs/emoji/26d3.svg" />',
      );
      expect(emojify('🪝')).toEqual(
        '<img draggable="false" class="emojione" alt="🪝" title=":hook:" src="/packs/emoji/1fa9d.svg" />',
      );
      expect(emojify('🧰')).toEqual(
        '<img draggable="false" class="emojione" alt="🧰" title=":toolbox:" src="/packs/emoji/1f9f0.svg" />',
      );
      expect(emojify('🧲')).toEqual(
        '<img draggable="false" class="emojione" alt="🧲" title=":magnet:" src="/packs/emoji/1f9f2.svg" />',
      );
      expect(emojify('🪜')).toEqual(
        '<img draggable="false" class="emojione" alt="🪜" title=":ladder:" src="/packs/emoji/1fa9c.svg" />',
      );
      expect(emojify('⚗️')).toEqual(
        '<img draggable="false" class="emojione" alt="⚗️" title=":alembic:" src="/packs/emoji/2697.svg" />',
      );
      expect(emojify('🧪')).toEqual(
        '<img draggable="false" class="emojione" alt="🧪" title=":test_tube:" src="/packs/emoji/1f9ea.svg" />',
      );
      expect(emojify('🧫')).toEqual(
        '<img draggable="false" class="emojione" alt="🧫" title=":petri_dish:" src="/packs/emoji/1f9eb.svg" />',
      );
      expect(emojify('🧬')).toEqual(
        '<img draggable="false" class="emojione" alt="🧬" title=":dna:" src="/packs/emoji/1f9ec.svg" />',
      );
      expect(emojify('🔬')).toEqual(
        '<img draggable="false" class="emojione" alt="🔬" title=":microscope:" src="/packs/emoji/1f52c.svg" />',
      );
      expect(emojify('🔭')).toEqual(
        '<img draggable="false" class="emojione" alt="🔭" title=":telescope:" src="/packs/emoji/1f52d.svg" />',
      );
      expect(emojify('📡')).toEqual(
        '<img draggable="false" class="emojione" alt="📡" title=":satellite_antenna:" src="/packs/emoji/1f4e1.svg" />',
      );
      expect(emojify('💉')).toEqual(
        '<img draggable="false" class="emojione" alt="💉" title=":syringe:" src="/packs/emoji/1f489.svg" />',
      );
      expect(emojify('🩸')).toEqual(
        '<img draggable="false" class="emojione" alt="🩸" title=":drop_of_blood:" src="/packs/emoji/1fa78.svg" />',
      );
      expect(emojify('💊')).toEqual(
        '<img draggable="false" class="emojione" alt="💊" title=":pill:" src="/packs/emoji/1f48a.svg" />',
      );
      expect(emojify('🩹')).toEqual(
        '<img draggable="false" class="emojione" alt="🩹" title=":adhesive_bandage:" src="/packs/emoji/1fa79.svg" />',
      );
      expect(emojify('🩼')).toEqual(
        '<img draggable="false" class="emojione" alt="🩼" title=":crutch:" src="/packs/emoji/1fa7c.svg" />',
      );
      expect(emojify('🩺')).toEqual(
        '<img draggable="false" class="emojione" alt="🩺" title=":stethoscope:" src="/packs/emoji/1fa7a.svg" />',
      );
      expect(emojify('🩻')).toEqual(
        '<img draggable="false" class="emojione" alt="🩻" title=":x-ray:" src="/packs/emoji/1fa7b.svg" />',
      );
      expect(emojify('🚪')).toEqual(
        '<img draggable="false" class="emojione" alt="🚪" title=":door:" src="/packs/emoji/1f6aa.svg" />',
      );
      expect(emojify('🛗')).toEqual(
        '<img draggable="false" class="emojione" alt="🛗" title=":elevator:" src="/packs/emoji/1f6d7.svg" />',
      );
      expect(emojify('🪞')).toEqual(
        '<img draggable="false" class="emojione" alt="🪞" title=":mirror:" src="/packs/emoji/1fa9e.svg" />',
      );
      expect(emojify('🪟')).toEqual(
        '<img draggable="false" class="emojione" alt="🪟" title=":window:" src="/packs/emoji/1fa9f.svg" />',
      );
      expect(emojify('🛏️')).toEqual(
        '<img draggable="false" class="emojione" alt="🛏️" title=":bed:" src="/packs/emoji/1f6cf.svg" />',
      );
      expect(emojify('🛋️')).toEqual(
        '<img draggable="false" class="emojione" alt="🛋️" title=":couch_and_lamp:" src="/packs/emoji/1f6cb.svg" />',
      );
      expect(emojify('🪑')).toEqual(
        '<img draggable="false" class="emojione" alt="🪑" title=":chair:" src="/packs/emoji/1fa91.svg" />',
      );
      expect(emojify('🚽')).toEqual(
        '<img draggable="false" class="emojione" alt="🚽" title=":toilet:" src="/packs/emoji/1f6bd.svg" />',
      );
      expect(emojify('🪠')).toEqual(
        '<img draggable="false" class="emojione" alt="🪠" title=":plunger:" src="/packs/emoji/1faa0.svg" />',
      );
      expect(emojify('🚿')).toEqual(
        '<img draggable="false" class="emojione" alt="🚿" title=":shower:" src="/packs/emoji/1f6bf.svg" />',
      );
      expect(emojify('🛁')).toEqual(
        '<img draggable="false" class="emojione" alt="🛁" title=":bathtub:" src="/packs/emoji/1f6c1.svg" />',
      );
      expect(emojify('🪤')).toEqual(
        '<img draggable="false" class="emojione" alt="🪤" title=":mouse_trap:" src="/packs/emoji/1faa4.svg" />',
      );
      expect(emojify('🪒')).toEqual(
        '<img draggable="false" class="emojione" alt="🪒" title=":razor:" src="/packs/emoji/1fa92.svg" />',
      );
      expect(emojify('🧴')).toEqual(
        '<img draggable="false" class="emojione" alt="🧴" title=":lotion_bottle:" src="/packs/emoji/1f9f4.svg" />',
      );
      expect(emojify('🧷')).toEqual(
        '<img draggable="false" class="emojione" alt="🧷" title=":safety_pin:" src="/packs/emoji/1f9f7.svg" />',
      );
      expect(emojify('🧹')).toEqual(
        '<img draggable="false" class="emojione" alt="🧹" title=":broom:" src="/packs/emoji/1f9f9.svg" />',
      );
      expect(emojify('🧺')).toEqual(
        '<img draggable="false" class="emojione" alt="🧺" title=":basket:" src="/packs/emoji/1f9fa.svg" />',
      );
      expect(emojify('🧻')).toEqual(
        '<img draggable="false" class="emojione" alt="🧻" title=":roll_of_paper:" src="/packs/emoji/1f9fb.svg" />',
      );
      expect(emojify('🪣')).toEqual(
        '<img draggable="false" class="emojione" alt="🪣" title=":bucket:" src="/packs/emoji/1faa3.svg" />',
      );
      expect(emojify('🧼')).toEqual(
        '<img draggable="false" class="emojione" alt="🧼" title=":soap:" src="/packs/emoji/1f9fc.svg" />',
      );
      expect(emojify('🫧')).toEqual(
        '<img draggable="false" class="emojione" alt="🫧" title=":bubbles:" src="/packs/emoji/1fae7.svg" />',
      );
      expect(emojify('🪥')).toEqual(
        '<img draggable="false" class="emojione" alt="🪥" title=":toothbrush:" src="/packs/emoji/1faa5.svg" />',
      );
      expect(emojify('🧽')).toEqual(
        '<img draggable="false" class="emojione" alt="🧽" title=":sponge:" src="/packs/emoji/1f9fd.svg" />',
      );
      expect(emojify('🧯')).toEqual(
        '<img draggable="false" class="emojione" alt="🧯" title=":fire_extinguisher:" src="/packs/emoji/1f9ef.svg" />',
      );
      expect(emojify('🛒')).toEqual(
        '<img draggable="false" class="emojione" alt="🛒" title=":shopping_trolley:" src="/packs/emoji/1f6d2.svg" />',
      );
      expect(emojify('🚬')).toEqual(
        '<img draggable="false" class="emojione" alt="🚬" title=":smoking:" src="/packs/emoji/1f6ac.svg" />',
      );
      expect(emojify('⚰️')).toEqual(
        '<img draggable="false" class="emojione" alt="⚰️" title=":coffin:" src="/packs/emoji/26b0.svg" />',
      );
      expect(emojify('🪦')).toEqual(
        '<img draggable="false" class="emojione" alt="🪦" title=":headstone:" src="/packs/emoji/1faa6.svg" />',
      );
      expect(emojify('⚱️')).toEqual(
        '<img draggable="false" class="emojione" alt="⚱️" title=":funeral_urn:" src="/packs/emoji/26b1.svg" />',
      );
      expect(emojify('🗿')).toEqual(
        '<img draggable="false" class="emojione" alt="🗿" title=":moyai:" src="/packs/emoji/1f5ff.svg" />',
      );
      expect(emojify('🪧')).toEqual(
        '<img draggable="false" class="emojione" alt="🪧" title=":placard:" src="/packs/emoji/1faa7.svg" />',
      );
      expect(emojify('🪪')).toEqual(
        '<img draggable="false" class="emojione" alt="🪪" title=":identification_card:" src="/packs/emoji/1faaa.svg" />',
      );
      expect(emojify('🏧')).toEqual(
        '<img draggable="false" class="emojione" alt="🏧" title=":atm:" src="/packs/emoji/1f3e7.svg" />',
      );
      expect(emojify('🚮')).toEqual(
        '<img draggable="false" class="emojione" alt="🚮" title=":put_litter_in_its_place:" src="/packs/emoji/1f6ae.svg" />',
      );
      expect(emojify('🚰')).toEqual(
        '<img draggable="false" class="emojione" alt="🚰" title=":potable_water:" src="/packs/emoji/1f6b0.svg" />',
      );
      expect(emojify('♿')).toEqual(
        '<img draggable="false" class="emojione" alt="♿" title=":wheelchair:" src="/packs/emoji/267f.svg" />',
      );
      expect(emojify('🚹')).toEqual(
        '<img draggable="false" class="emojione" alt="🚹" title=":mens:" src="/packs/emoji/1f6b9.svg" />',
      );
      expect(emojify('🚺')).toEqual(
        '<img draggable="false" class="emojione" alt="🚺" title=":womens:" src="/packs/emoji/1f6ba.svg" />',
      );
      expect(emojify('🚻')).toEqual(
        '<img draggable="false" class="emojione" alt="🚻" title=":restroom:" src="/packs/emoji/1f6bb.svg" />',
      );
      expect(emojify('🚼')).toEqual(
        '<img draggable="false" class="emojione" alt="🚼" title=":baby_symbol:" src="/packs/emoji/1f6bc.svg" />',
      );
      expect(emojify('🚾')).toEqual(
        '<img draggable="false" class="emojione" alt="🚾" title=":wc:" src="/packs/emoji/1f6be.svg" />',
      );
      expect(emojify('🛂')).toEqual(
        '<img draggable="false" class="emojione" alt="🛂" title=":passport_control:" src="/packs/emoji/1f6c2.svg" />',
      );
      expect(emojify('🛃')).toEqual(
        '<img draggable="false" class="emojione" alt="🛃" title=":customs:" src="/packs/emoji/1f6c3.svg" />',
      );
      expect(emojify('🛄')).toEqual(
        '<img draggable="false" class="emojione" alt="🛄" title=":baggage_claim:" src="/packs/emoji/1f6c4.svg" />',
      );
      expect(emojify('🛅')).toEqual(
        '<img draggable="false" class="emojione" alt="🛅" title=":left_luggage:" src="/packs/emoji/1f6c5.svg" />',
      );
      expect(emojify('⚠️')).toEqual(
        '<img draggable="false" class="emojione" alt="⚠️" title=":warning:" src="/packs/emoji/26a0.svg" />',
      );
      expect(emojify('🚸')).toEqual(
        '<img draggable="false" class="emojione" alt="🚸" title=":children_crossing:" src="/packs/emoji/1f6b8.svg" />',
      );
      expect(emojify('⛔')).toEqual(
        '<img draggable="false" class="emojione" alt="⛔" title=":no_entry:" src="/packs/emoji/26d4.svg" />',
      );
      expect(emojify('🚫')).toEqual(
        '<img draggable="false" class="emojione" alt="🚫" title=":no_entry_sign:" src="/packs/emoji/1f6ab.svg" />',
      );
      expect(emojify('🚳')).toEqual(
        '<img draggable="false" class="emojione" alt="🚳" title=":no_bicycles:" src="/packs/emoji/1f6b3.svg" />',
      );
      expect(emojify('🚭')).toEqual(
        '<img draggable="false" class="emojione" alt="🚭" title=":no_smoking:" src="/packs/emoji/1f6ad.svg" />',
      );
      expect(emojify('🚯')).toEqual(
        '<img draggable="false" class="emojione" alt="🚯" title=":do_not_litter:" src="/packs/emoji/1f6af.svg" />',
      );
      expect(emojify('🚱')).toEqual(
        '<img draggable="false" class="emojione" alt="🚱" title=":non-potable_water:" src="/packs/emoji/1f6b1.svg" />',
      );
      expect(emojify('🚷')).toEqual(
        '<img draggable="false" class="emojione" alt="🚷" title=":no_pedestrians:" src="/packs/emoji/1f6b7.svg" />',
      );
      expect(emojify('📵')).toEqual(
        '<img draggable="false" class="emojione" alt="📵" title=":no_mobile_phones:" src="/packs/emoji/1f4f5.svg" />',
      );
      expect(emojify('🔞')).toEqual(
        '<img draggable="false" class="emojione" alt="🔞" title=":underage:" src="/packs/emoji/1f51e.svg" />',
      );
      expect(emojify('☢️')).toEqual(
        '<img draggable="false" class="emojione" alt="☢️" title=":radioactive_sign:" src="/packs/emoji/2622.svg" />',
      );
      expect(emojify('☣️')).toEqual(
        '<img draggable="false" class="emojione" alt="☣️" title=":biohazard_sign:" src="/packs/emoji/2623.svg" />',
      );
      expect(emojify('⬆️')).toEqual(
        '<img draggable="false" class="emojione" alt="⬆️" title=":arrow_up:" src="/packs/emoji/2b06.svg" />',
      );
      expect(emojify('↗️')).toEqual(
        '<img draggable="false" class="emojione" alt="↗️" title=":arrow_upper_right:" src="/packs/emoji/2197.svg" />',
      );
      expect(emojify('➡️')).toEqual(
        '<img draggable="false" class="emojione" alt="➡️" title=":arrow_right:" src="/packs/emoji/27a1.svg" />',
      );
      expect(emojify('↘️')).toEqual(
        '<img draggable="false" class="emojione" alt="↘️" title=":arrow_lower_right:" src="/packs/emoji/2198.svg" />',
      );
      expect(emojify('⬇️')).toEqual(
        '<img draggable="false" class="emojione" alt="⬇️" title=":arrow_down:" src="/packs/emoji/2b07.svg" />',
      );
      expect(emojify('↙️')).toEqual(
        '<img draggable="false" class="emojione" alt="↙️" title=":arrow_lower_left:" src="/packs/emoji/2199.svg" />',
      );
      expect(emojify('⬅️')).toEqual(
        '<img draggable="false" class="emojione" alt="⬅️" title=":arrow_left:" src="/packs/emoji/2b05.svg" />',
      );
      expect(emojify('↖️')).toEqual(
        '<img draggable="false" class="emojione" alt="↖️" title=":arrow_upper_left:" src="/packs/emoji/2196.svg" />',
      );
      expect(emojify('↕️')).toEqual(
        '<img draggable="false" class="emojione" alt="↕️" title=":arrow_up_down:" src="/packs/emoji/2195.svg" />',
      );
      expect(emojify('↔️')).toEqual(
        '<img draggable="false" class="emojione" alt="↔️" title=":left_right_arrow:" src="/packs/emoji/2194.svg" />',
      );
      expect(emojify('↩️')).toEqual(
        '<img draggable="false" class="emojione" alt="↩️" title=":leftwards_arrow_with_hook:" src="/packs/emoji/21a9.svg" />',
      );
      expect(emojify('↪️')).toEqual(
        '<img draggable="false" class="emojione" alt="↪️" title=":arrow_right_hook:" src="/packs/emoji/21aa.svg" />',
      );
      expect(emojify('⤴️')).toEqual(
        '<img draggable="false" class="emojione" alt="⤴️" title=":arrow_heading_up:" src="/packs/emoji/2934.svg" />',
      );
      expect(emojify('⤵️')).toEqual(
        '<img draggable="false" class="emojione" alt="⤵️" title=":arrow_heading_down:" src="/packs/emoji/2935.svg" />',
      );
      expect(emojify('🔃')).toEqual(
        '<img draggable="false" class="emojione" alt="🔃" title=":arrows_clockwise:" src="/packs/emoji/1f503.svg" />',
      );
      expect(emojify('🔄')).toEqual(
        '<img draggable="false" class="emojione" alt="🔄" title=":arrows_counterclockwise:" src="/packs/emoji/1f504.svg" />',
      );
      expect(emojify('🔙')).toEqual(
        '<img draggable="false" class="emojione" alt="🔙" title=":back:" src="/packs/emoji/1f519.svg" />',
      );
      expect(emojify('🔚')).toEqual(
        '<img draggable="false" class="emojione" alt="🔚" title=":end:" src="/packs/emoji/1f51a.svg" />',
      );
      expect(emojify('🔛')).toEqual(
        '<img draggable="false" class="emojione" alt="🔛" title=":on:" src="/packs/emoji/1f51b.svg" />',
      );
      expect(emojify('🔜')).toEqual(
        '<img draggable="false" class="emojione" alt="🔜" title=":soon:" src="/packs/emoji/1f51c.svg" />',
      );
      expect(emojify('🔝')).toEqual(
        '<img draggable="false" class="emojione" alt="🔝" title=":top:" src="/packs/emoji/1f51d.svg" />',
      );
      expect(emojify('🛐')).toEqual(
        '<img draggable="false" class="emojione" alt="🛐" title=":place_of_worship:" src="/packs/emoji/1f6d0.svg" />',
      );
      expect(emojify('⚛️')).toEqual(
        '<img draggable="false" class="emojione" alt="⚛️" title=":atom_symbol:" src="/packs/emoji/269b.svg" />',
      );
      expect(emojify('🕉️')).toEqual(
        '<img draggable="false" class="emojione" alt="🕉️" title=":om_symbol:" src="/packs/emoji/1f549.svg" />',
      );
      expect(emojify('✡️')).toEqual(
        '<img draggable="false" class="emojione" alt="✡️" title=":star_of_david:" src="/packs/emoji/2721.svg" />',
      );
      expect(emojify('☸️')).toEqual(
        '<img draggable="false" class="emojione" alt="☸️" title=":wheel_of_dharma:" src="/packs/emoji/2638.svg" />',
      );
      expect(emojify('☯️')).toEqual(
        '<img draggable="false" class="emojione" alt="☯️" title=":yin_yang:" src="/packs/emoji/262f.svg" />',
      );
      expect(emojify('✝️')).toEqual(
        '<img draggable="false" class="emojione" alt="✝️" title=":latin_cross:" src="/packs/emoji/271d.svg" />',
      );
      expect(emojify('☦️')).toEqual(
        '<img draggable="false" class="emojione" alt="☦️" title=":orthodox_cross:" src="/packs/emoji/2626.svg" />',
      );
      expect(emojify('☪️')).toEqual(
        '<img draggable="false" class="emojione" alt="☪️" title=":star_and_crescent:" src="/packs/emoji/262a.svg" />',
      );
      expect(emojify('☮️')).toEqual(
        '<img draggable="false" class="emojione" alt="☮️" title=":peace_symbol:" src="/packs/emoji/262e.svg" />',
      );
      expect(emojify('🕎')).toEqual(
        '<img draggable="false" class="emojione" alt="🕎" title=":menorah_with_nine_branches:" src="/packs/emoji/1f54e.svg" />',
      );
      expect(emojify('🔯')).toEqual(
        '<img draggable="false" class="emojione" alt="🔯" title=":six_pointed_star:" src="/packs/emoji/1f52f.svg" />',
      );
      expect(emojify('♈')).toEqual(
        '<img draggable="false" class="emojione" alt="♈" title=":aries:" src="/packs/emoji/2648.svg" />',
      );
      expect(emojify('♉')).toEqual(
        '<img draggable="false" class="emojione" alt="♉" title=":taurus:" src="/packs/emoji/2649.svg" />',
      );
      expect(emojify('♊')).toEqual(
        '<img draggable="false" class="emojione" alt="♊" title=":gemini:" src="/packs/emoji/264a.svg" />',
      );
      expect(emojify('♋')).toEqual(
        '<img draggable="false" class="emojione" alt="♋" title=":cancer:" src="/packs/emoji/264b.svg" />',
      );
      expect(emojify('♌')).toEqual(
        '<img draggable="false" class="emojione" alt="♌" title=":leo:" src="/packs/emoji/264c.svg" />',
      );
      expect(emojify('♍')).toEqual(
        '<img draggable="false" class="emojione" alt="♍" title=":virgo:" src="/packs/emoji/264d.svg" />',
      );
      expect(emojify('♎')).toEqual(
        '<img draggable="false" class="emojione" alt="♎" title=":libra:" src="/packs/emoji/264e.svg" />',
      );
      expect(emojify('♏')).toEqual(
        '<img draggable="false" class="emojione" alt="♏" title=":scorpius:" src="/packs/emoji/264f.svg" />',
      );
      expect(emojify('♐')).toEqual(
        '<img draggable="false" class="emojione" alt="♐" title=":sagittarius:" src="/packs/emoji/2650.svg" />',
      );
      expect(emojify('♑')).toEqual(
        '<img draggable="false" class="emojione" alt="♑" title=":capricorn:" src="/packs/emoji/2651.svg" />',
      );
      expect(emojify('♒')).toEqual(
        '<img draggable="false" class="emojione" alt="♒" title=":aquarius:" src="/packs/emoji/2652.svg" />',
      );
      expect(emojify('♓')).toEqual(
        '<img draggable="false" class="emojione" alt="♓" title=":pisces:" src="/packs/emoji/2653.svg" />',
      );
      expect(emojify('⛎')).toEqual(
        '<img draggable="false" class="emojione" alt="⛎" title=":ophiuchus:" src="/packs/emoji/26ce.svg" />',
      );
      expect(emojify('🔀')).toEqual(
        '<img draggable="false" class="emojione" alt="🔀" title=":twisted_rightwards_arrows:" src="/packs/emoji/1f500.svg" />',
      );
      expect(emojify('🔁')).toEqual(
        '<img draggable="false" class="emojione" alt="🔁" title=":repeat:" src="/packs/emoji/1f501.svg" />',
      );
      expect(emojify('🔂')).toEqual(
        '<img draggable="false" class="emojione" alt="🔂" title=":repeat_one:" src="/packs/emoji/1f502.svg" />',
      );
      expect(emojify('▶️')).toEqual(
        '<img draggable="false" class="emojione" alt="▶️" title=":arrow_forward:" src="/packs/emoji/25b6.svg" />',
      );
      expect(emojify('⏩')).toEqual(
        '<img draggable="false" class="emojione" alt="⏩" title=":fast_forward:" src="/packs/emoji/23e9.svg" />',
      );
      expect(emojify('⏭️')).toEqual(
        '<img draggable="false" class="emojione" alt="⏭️" title=":black_right_pointing_double_triangle_with_vertical_bar:" src="/packs/emoji/23ed.svg" />',
      );
      expect(emojify('⏯️')).toEqual(
        '<img draggable="false" class="emojione" alt="⏯️" title=":black_right_pointing_triangle_with_double_vertical_bar:" src="/packs/emoji/23ef.svg" />',
      );
      expect(emojify('◀️')).toEqual(
        '<img draggable="false" class="emojione" alt="◀️" title=":arrow_backward:" src="/packs/emoji/25c0.svg" />',
      );
      expect(emojify('⏪')).toEqual(
        '<img draggable="false" class="emojione" alt="⏪" title=":rewind:" src="/packs/emoji/23ea.svg" />',
      );
      expect(emojify('⏮️')).toEqual(
        '<img draggable="false" class="emojione" alt="⏮️" title=":black_left_pointing_double_triangle_with_vertical_bar:" src="/packs/emoji/23ee.svg" />',
      );
      expect(emojify('🔼')).toEqual(
        '<img draggable="false" class="emojione" alt="🔼" title=":arrow_up_small:" src="/packs/emoji/1f53c.svg" />',
      );
      expect(emojify('⏫')).toEqual(
        '<img draggable="false" class="emojione" alt="⏫" title=":arrow_double_up:" src="/packs/emoji/23eb.svg" />',
      );
      expect(emojify('🔽')).toEqual(
        '<img draggable="false" class="emojione" alt="🔽" title=":arrow_down_small:" src="/packs/emoji/1f53d.svg" />',
      );
      expect(emojify('⏬')).toEqual(
        '<img draggable="false" class="emojione" alt="⏬" title=":arrow_double_down:" src="/packs/emoji/23ec.svg" />',
      );
      expect(emojify('⏸️')).toEqual(
        '<img draggable="false" class="emojione" alt="⏸️" title=":double_vertical_bar:" src="/packs/emoji/23f8.svg" />',
      );
      expect(emojify('⏹️')).toEqual(
        '<img draggable="false" class="emojione" alt="⏹️" title=":black_square_for_stop:" src="/packs/emoji/23f9.svg" />',
      );
      expect(emojify('⏺️')).toEqual(
        '<img draggable="false" class="emojione" alt="⏺️" title=":black_circle_for_record:" src="/packs/emoji/23fa.svg" />',
      );
      expect(emojify('⏏️')).toEqual(
        '<img draggable="false" class="emojione" alt="⏏️" title=":eject:" src="/packs/emoji/23cf.svg" />',
      );
      expect(emojify('🎦')).toEqual(
        '<img draggable="false" class="emojione" alt="🎦" title=":cinema:" src="/packs/emoji/1f3a6.svg" />',
      );
      expect(emojify('🔅')).toEqual(
        '<img draggable="false" class="emojione" alt="🔅" title=":low_brightness:" src="/packs/emoji/1f505.svg" />',
      );
      expect(emojify('🔆')).toEqual(
        '<img draggable="false" class="emojione" alt="🔆" title=":high_brightness:" src="/packs/emoji/1f506.svg" />',
      );
      expect(emojify('📶')).toEqual(
        '<img draggable="false" class="emojione" alt="📶" title=":signal_strength:" src="/packs/emoji/1f4f6.svg" />',
      );
      expect(emojify('📳')).toEqual(
        '<img draggable="false" class="emojione" alt="📳" title=":vibration_mode:" src="/packs/emoji/1f4f3.svg" />',
      );
      expect(emojify('📴')).toEqual(
        '<img draggable="false" class="emojione" alt="📴" title=":mobile_phone_off:" src="/packs/emoji/1f4f4.svg" />',
      );
      expect(emojify('♀️')).toEqual(
        '<img draggable="false" class="emojione" alt="♀️" title=":female_sign:" src="/packs/emoji/2640.svg" />',
      );
      expect(emojify('♂️')).toEqual(
        '<img draggable="false" class="emojione" alt="♂️" title=":male_sign:" src="/packs/emoji/2642.svg" />',
      );
      expect(emojify('⚧️')).toEqual(
        '<img draggable="false" class="emojione" alt="⚧️" title=":transgender_symbol:" src="/packs/emoji/26a7.svg" />',
      );
      expect(emojify('✖️')).toEqual(
        '<img draggable="false" class="emojione" alt="✖️" title=":heavy_multiplication_x:" src="/packs/emoji/2716.svg" />',
      );
      expect(emojify('➕')).toEqual(
        '<img draggable="false" class="emojione" alt="➕" title=":heavy_plus_sign:" src="/packs/emoji/2795.svg" />',
      );
      expect(emojify('➖')).toEqual(
        '<img draggable="false" class="emojione" alt="➖" title=":heavy_minus_sign:" src="/packs/emoji/2796.svg" />',
      );
      expect(emojify('➗')).toEqual(
        '<img draggable="false" class="emojione" alt="➗" title=":heavy_division_sign:" src="/packs/emoji/2797.svg" />',
      );
      expect(emojify('🟰')).toEqual(
        '<img draggable="false" class="emojione" alt="🟰" title=":heavy_equals_sign:" src="/packs/emoji/1f7f0.svg" />',
      );
      expect(emojify('♾️')).toEqual(
        '<img draggable="false" class="emojione" alt="♾️" title=":infinity:" src="/packs/emoji/267e.svg" />',
      );
      expect(emojify('‼️')).toEqual(
        '<img draggable="false" class="emojione" alt="‼️" title=":bangbang:" src="/packs/emoji/203c.svg" />',
      );
      expect(emojify('⁉️')).toEqual(
        '<img draggable="false" class="emojione" alt="⁉️" title=":interrobang:" src="/packs/emoji/2049.svg" />',
      );
      expect(emojify('❓')).toEqual(
        '<img draggable="false" class="emojione" alt="❓" title=":question:" src="/packs/emoji/2753.svg" />',
      );
      expect(emojify('❔')).toEqual(
        '<img draggable="false" class="emojione" alt="❔" title=":grey_question:" src="/packs/emoji/2754.svg" />',
      );
      expect(emojify('❕')).toEqual(
        '<img draggable="false" class="emojione" alt="❕" title=":grey_exclamation:" src="/packs/emoji/2755.svg" />',
      );
      expect(emojify('❗')).toEqual(
        '<img draggable="false" class="emojione" alt="❗" title=":exclamation:" src="/packs/emoji/2757.svg" />',
      );
      expect(emojify('〰️')).toEqual(
        '<img draggable="false" class="emojione" alt="〰️" title=":wavy_dash:" src="/packs/emoji/3030.svg" />',
      );
      expect(emojify('💱')).toEqual(
        '<img draggable="false" class="emojione" alt="💱" title=":currency_exchange:" src="/packs/emoji/1f4b1.svg" />',
      );
      expect(emojify('💲')).toEqual(
        '<img draggable="false" class="emojione" alt="💲" title=":heavy_dollar_sign:" src="/packs/emoji/1f4b2.svg" />',
      );
      expect(emojify('⚕️')).toEqual(
        '<img draggable="false" class="emojione" alt="⚕️" title=":medical_symbol:" src="/packs/emoji/2695.svg" />',
      );
      expect(emojify('♻️')).toEqual(
        '<img draggable="false" class="emojione" alt="♻️" title=":recycle:" src="/packs/emoji/267b.svg" />',
      );
      expect(emojify('⚜️')).toEqual(
        '<img draggable="false" class="emojione" alt="⚜️" title=":fleur_de_lis:" src="/packs/emoji/269c.svg" />',
      );
      expect(emojify('🔱')).toEqual(
        '<img draggable="false" class="emojione" alt="🔱" title=":trident:" src="/packs/emoji/1f531.svg" />',
      );
      expect(emojify('📛')).toEqual(
        '<img draggable="false" class="emojione" alt="📛" title=":name_badge:" src="/packs/emoji/1f4db.svg" />',
      );
      expect(emojify('🔰')).toEqual(
        '<img draggable="false" class="emojione" alt="🔰" title=":beginner:" src="/packs/emoji/1f530.svg" />',
      );
      expect(emojify('⭕')).toEqual(
        '<img draggable="false" class="emojione" alt="⭕" title=":o:" src="/packs/emoji/2b55.svg" />',
      );
      expect(emojify('✅')).toEqual(
        '<img draggable="false" class="emojione" alt="✅" title=":white_check_mark:" src="/packs/emoji/2705.svg" />',
      );
      expect(emojify('☑️')).toEqual(
        '<img draggable="false" class="emojione" alt="☑️" title=":ballot_box_with_check:" src="/packs/emoji/2611.svg" />',
      );
      expect(emojify('✔️')).toEqual(
        '<img draggable="false" class="emojione" alt="✔️" title=":heavy_check_mark:" src="/packs/emoji/2714.svg" />',
      );
      expect(emojify('❌')).toEqual(
        '<img draggable="false" class="emojione" alt="❌" title=":x:" src="/packs/emoji/274c.svg" />',
      );
      expect(emojify('❎')).toEqual(
        '<img draggable="false" class="emojione" alt="❎" title=":negative_squared_cross_mark:" src="/packs/emoji/274e.svg" />',
      );
      expect(emojify('➰')).toEqual(
        '<img draggable="false" class="emojione" alt="➰" title=":curly_loop:" src="/packs/emoji/27b0.svg" />',
      );
      expect(emojify('➿')).toEqual(
        '<img draggable="false" class="emojione" alt="➿" title=":loop:" src="/packs/emoji/27bf.svg" />',
      );
      expect(emojify('〽️')).toEqual(
        '<img draggable="false" class="emojione" alt="〽️" title=":part_alternation_mark:" src="/packs/emoji/303d.svg" />',
      );
      expect(emojify('✳️')).toEqual(
        '<img draggable="false" class="emojione" alt="✳️" title=":eight_spoked_asterisk:" src="/packs/emoji/2733.svg" />',
      );
      expect(emojify('✴️')).toEqual(
        '<img draggable="false" class="emojione" alt="✴️" title=":eight_pointed_black_star:" src="/packs/emoji/2734.svg" />',
      );
      expect(emojify('❇️')).toEqual(
        '<img draggable="false" class="emojione" alt="❇️" title=":sparkle:" src="/packs/emoji/2747.svg" />',
      );
      expect(emojify('©️')).toEqual(
        '<img draggable="false" class="emojione" alt="©️" title=":copyright:" src="/packs/emoji/a9.svg" />',
      );
      expect(emojify('®️')).toEqual(
        '<img draggable="false" class="emojione" alt="®️" title=":registered:" src="/packs/emoji/ae.svg" />',
      );
      expect(emojify('™️')).toEqual(
        '<img draggable="false" class="emojione" alt="™️" title=":tm:" src="/packs/emoji/2122.svg" />',
      );
      expect(emojify('#️⃣')).toEqual(
        '<img draggable="false" class="emojione" alt="#️⃣" title=":hash:" src="/packs/emoji/23-20e3.svg" />',
      );
      expect(emojify('*️⃣')).toEqual(
        '<img draggable="false" class="emojione" alt="*️⃣" title=":keycap_star:" src="/packs/emoji/2a-20e3.svg" />',
      );
      expect(emojify('0️⃣')).toEqual(
        '<img draggable="false" class="emojione" alt="0️⃣" title=":zero:" src="/packs/emoji/30-20e3.svg" />',
      );
      expect(emojify('1️⃣')).toEqual(
        '<img draggable="false" class="emojione" alt="1️⃣" title=":one:" src="/packs/emoji/31-20e3.svg" />',
      );
      expect(emojify('2️⃣')).toEqual(
        '<img draggable="false" class="emojione" alt="2️⃣" title=":two:" src="/packs/emoji/32-20e3.svg" />',
      );
      expect(emojify('3️⃣')).toEqual(
        '<img draggable="false" class="emojione" alt="3️⃣" title=":three:" src="/packs/emoji/33-20e3.svg" />',
      );
      expect(emojify('4️⃣')).toEqual(
        '<img draggable="false" class="emojione" alt="4️⃣" title=":four:" src="/packs/emoji/34-20e3.svg" />',
      );
      expect(emojify('5️⃣')).toEqual(
        '<img draggable="false" class="emojione" alt="5️⃣" title=":five:" src="/packs/emoji/35-20e3.svg" />',
      );
      expect(emojify('6️⃣')).toEqual(
        '<img draggable="false" class="emojione" alt="6️⃣" title=":six:" src="/packs/emoji/36-20e3.svg" />',
      );
      expect(emojify('7️⃣')).toEqual(
        '<img draggable="false" class="emojione" alt="7️⃣" title=":seven:" src="/packs/emoji/37-20e3.svg" />',
      );
      expect(emojify('8️⃣')).toEqual(
        '<img draggable="false" class="emojione" alt="8️⃣" title=":eight:" src="/packs/emoji/38-20e3.svg" />',
      );
      expect(emojify('9️⃣')).toEqual(
        '<img draggable="false" class="emojione" alt="9️⃣" title=":nine:" src="/packs/emoji/39-20e3.svg" />',
      );
      expect(emojify('🔟')).toEqual(
        '<img draggable="false" class="emojione" alt="🔟" title=":keycap_ten:" src="/packs/emoji/1f51f.svg" />',
      );
      expect(emojify('🔠')).toEqual(
        '<img draggable="false" class="emojione" alt="🔠" title=":capital_abcd:" src="/packs/emoji/1f520.svg" />',
      );
      expect(emojify('🔡')).toEqual(
        '<img draggable="false" class="emojione" alt="🔡" title=":abcd:" src="/packs/emoji/1f521.svg" />',
      );
      expect(emojify('🔣')).toEqual(
        '<img draggable="false" class="emojione" alt="🔣" title=":symbols:" src="/packs/emoji/1f523.svg" />',
      );
      expect(emojify('🔤')).toEqual(
        '<img draggable="false" class="emojione" alt="🔤" title=":abc:" src="/packs/emoji/1f524.svg" />',
      );
      expect(emojify('🅰️')).toEqual(
        '<img draggable="false" class="emojione" alt="🅰️" title=":a:" src="/packs/emoji/1f170.svg" />',
      );
      expect(emojify('🆎')).toEqual(
        '<img draggable="false" class="emojione" alt="🆎" title=":ab:" src="/packs/emoji/1f18e.svg" />',
      );
      expect(emojify('🅱️')).toEqual(
        '<img draggable="false" class="emojione" alt="🅱️" title=":b:" src="/packs/emoji/1f171.svg" />',
      );
      expect(emojify('🆑')).toEqual(
        '<img draggable="false" class="emojione" alt="🆑" title=":cl:" src="/packs/emoji/1f191.svg" />',
      );
      expect(emojify('🆒')).toEqual(
        '<img draggable="false" class="emojione" alt="🆒" title=":cool:" src="/packs/emoji/1f192.svg" />',
      );
      expect(emojify('🆓')).toEqual(
        '<img draggable="false" class="emojione" alt="🆓" title=":free:" src="/packs/emoji/1f193.svg" />',
      );
      expect(emojify('ℹ️')).toEqual(
        '<img draggable="false" class="emojione" alt="ℹ️" title=":information_source:" src="/packs/emoji/2139.svg" />',
      );
      expect(emojify('🆔')).toEqual(
        '<img draggable="false" class="emojione" alt="🆔" title=":id:" src="/packs/emoji/1f194.svg" />',
      );
      expect(emojify('Ⓜ️')).toEqual(
        '<img draggable="false" class="emojione" alt="Ⓜ️" title=":m:" src="/packs/emoji/24c2.svg" />',
      );
      expect(emojify('🆕')).toEqual(
        '<img draggable="false" class="emojione" alt="🆕" title=":new:" src="/packs/emoji/1f195.svg" />',
      );
      expect(emojify('🆖')).toEqual(
        '<img draggable="false" class="emojione" alt="🆖" title=":ng:" src="/packs/emoji/1f196.svg" />',
      );
      expect(emojify('🅾️')).toEqual(
        '<img draggable="false" class="emojione" alt="🅾️" title=":o2:" src="/packs/emoji/1f17e.svg" />',
      );
      expect(emojify('🆗')).toEqual(
        '<img draggable="false" class="emojione" alt="🆗" title=":ok:" src="/packs/emoji/1f197.svg" />',
      );
      expect(emojify('🅿️')).toEqual(
        '<img draggable="false" class="emojione" alt="🅿️" title=":parking:" src="/packs/emoji/1f17f.svg" />',
      );
      expect(emojify('🆘')).toEqual(
        '<img draggable="false" class="emojione" alt="🆘" title=":sos:" src="/packs/emoji/1f198.svg" />',
      );
      expect(emojify('🆙')).toEqual(
        '<img draggable="false" class="emojione" alt="🆙" title=":up:" src="/packs/emoji/1f199.svg" />',
      );
      expect(emojify('🆚')).toEqual(
        '<img draggable="false" class="emojione" alt="🆚" title=":vs:" src="/packs/emoji/1f19a.svg" />',
      );
      expect(emojify('🈁')).toEqual(
        '<img draggable="false" class="emojione" alt="🈁" title=":koko:" src="/packs/emoji/1f201.svg" />',
      );
      expect(emojify('🈂️')).toEqual(
        '<img draggable="false" class="emojione" alt="🈂️" title=":sa:" src="/packs/emoji/1f202.svg" />',
      );
      expect(emojify('🈷️')).toEqual(
        '<img draggable="false" class="emojione" alt="🈷️" title=":u6708:" src="/packs/emoji/1f237.svg" />',
      );
      expect(emojify('🈶')).toEqual(
        '<img draggable="false" class="emojione" alt="🈶" title=":u6709:" src="/packs/emoji/1f236.svg" />',
      );
      expect(emojify('🈯')).toEqual(
        '<img draggable="false" class="emojione" alt="🈯" title=":u6307:" src="/packs/emoji/1f22f.svg" />',
      );
      expect(emojify('🉐')).toEqual(
        '<img draggable="false" class="emojione" alt="🉐" title=":ideograph_advantage:" src="/packs/emoji/1f250.svg" />',
      );
      expect(emojify('🈹')).toEqual(
        '<img draggable="false" class="emojione" alt="🈹" title=":u5272:" src="/packs/emoji/1f239.svg" />',
      );
      expect(emojify('🈚')).toEqual(
        '<img draggable="false" class="emojione" alt="🈚" title=":u7121:" src="/packs/emoji/1f21a.svg" />',
      );
      expect(emojify('🈲')).toEqual(
        '<img draggable="false" class="emojione" alt="🈲" title=":u7981:" src="/packs/emoji/1f232.svg" />',
      );
      expect(emojify('🉑')).toEqual(
        '<img draggable="false" class="emojione" alt="🉑" title=":accept:" src="/packs/emoji/1f251.svg" />',
      );
      expect(emojify('🈸')).toEqual(
        '<img draggable="false" class="emojione" alt="🈸" title=":u7533:" src="/packs/emoji/1f238.svg" />',
      );
      expect(emojify('🈴')).toEqual(
        '<img draggable="false" class="emojione" alt="🈴" title=":u5408:" src="/packs/emoji/1f234.svg" />',
      );
      expect(emojify('🈳')).toEqual(
        '<img draggable="false" class="emojione" alt="🈳" title=":u7a7a:" src="/packs/emoji/1f233.svg" />',
      );
      expect(emojify('㊗️')).toEqual(
        '<img draggable="false" class="emojione" alt="㊗️" title=":congratulations:" src="/packs/emoji/3297.svg" />',
      );
      expect(emojify('㊙️')).toEqual(
        '<img draggable="false" class="emojione" alt="㊙️" title=":secret:" src="/packs/emoji/3299.svg" />',
      );
      expect(emojify('🈺')).toEqual(
        '<img draggable="false" class="emojione" alt="🈺" title=":u55b6:" src="/packs/emoji/1f23a.svg" />',
      );
      expect(emojify('🈵')).toEqual(
        '<img draggable="false" class="emojione" alt="🈵" title=":u6e80:" src="/packs/emoji/1f235.svg" />',
      );
      expect(emojify('🔴')).toEqual(
        '<img draggable="false" class="emojione" alt="🔴" title=":red_circle:" src="/packs/emoji/1f534.svg" />',
      );
      expect(emojify('🟠')).toEqual(
        '<img draggable="false" class="emojione" alt="🟠" title=":large_orange_circle:" src="/packs/emoji/1f7e0.svg" />',
      );
      expect(emojify('🟡')).toEqual(
        '<img draggable="false" class="emojione" alt="🟡" title=":large_yellow_circle:" src="/packs/emoji/1f7e1.svg" />',
      );
      expect(emojify('🟢')).toEqual(
        '<img draggable="false" class="emojione" alt="🟢" title=":large_green_circle:" src="/packs/emoji/1f7e2.svg" />',
      );
      expect(emojify('🔵')).toEqual(
        '<img draggable="false" class="emojione" alt="🔵" title=":large_blue_circle:" src="/packs/emoji/1f535.svg" />',
      );
      expect(emojify('🟣')).toEqual(
        '<img draggable="false" class="emojione" alt="🟣" title=":large_purple_circle:" src="/packs/emoji/1f7e3.svg" />',
      );
      expect(emojify('🟤')).toEqual(
        '<img draggable="false" class="emojione" alt="🟤" title=":large_brown_circle:" src="/packs/emoji/1f7e4.svg" />',
      );
      expect(emojify('⚫')).toEqual(
        '<img draggable="false" class="emojione" alt="⚫" title=":black_circle:" src="/packs/emoji/26ab.svg" />',
      );
      expect(emojify('⚪')).toEqual(
        '<img draggable="false" class="emojione" alt="⚪" title=":white_circle:" src="/packs/emoji/26aa.svg" />',
      );
      expect(emojify('🟥')).toEqual(
        '<img draggable="false" class="emojione" alt="🟥" title=":large_red_square:" src="/packs/emoji/1f7e5.svg" />',
      );
      expect(emojify('🟧')).toEqual(
        '<img draggable="false" class="emojione" alt="🟧" title=":large_orange_square:" src="/packs/emoji/1f7e7.svg" />',
      );
      expect(emojify('🟨')).toEqual(
        '<img draggable="false" class="emojione" alt="🟨" title=":large_yellow_square:" src="/packs/emoji/1f7e8.svg" />',
      );
      expect(emojify('🟩')).toEqual(
        '<img draggable="false" class="emojione" alt="🟩" title=":large_green_square:" src="/packs/emoji/1f7e9.svg" />',
      );
      expect(emojify('🟦')).toEqual(
        '<img draggable="false" class="emojione" alt="🟦" title=":large_blue_square:" src="/packs/emoji/1f7e6.svg" />',
      );
      expect(emojify('🟪')).toEqual(
        '<img draggable="false" class="emojione" alt="🟪" title=":large_purple_square:" src="/packs/emoji/1f7ea.svg" />',
      );
      expect(emojify('🟫')).toEqual(
        '<img draggable="false" class="emojione" alt="🟫" title=":large_brown_square:" src="/packs/emoji/1f7eb.svg" />',
      );
      expect(emojify('⬛')).toEqual(
        '<img draggable="false" class="emojione" alt="⬛" title=":black_large_square:" src="/packs/emoji/2b1b.svg" />',
      );
      expect(emojify('⬜')).toEqual(
        '<img draggable="false" class="emojione" alt="⬜" title=":white_large_square:" src="/packs/emoji/2b1c.svg" />',
      );
      expect(emojify('◼️')).toEqual(
        '<img draggable="false" class="emojione" alt="◼️" title=":black_medium_square:" src="/packs/emoji/25fc.svg" />',
      );
      expect(emojify('◻️')).toEqual(
        '<img draggable="false" class="emojione" alt="◻️" title=":white_medium_square:" src="/packs/emoji/25fb.svg" />',
      );
      expect(emojify('◾')).toEqual(
        '<img draggable="false" class="emojione" alt="◾" title=":black_medium_small_square:" src="/packs/emoji/25fe.svg" />',
      );
      expect(emojify('◽')).toEqual(
        '<img draggable="false" class="emojione" alt="◽" title=":white_medium_small_square:" src="/packs/emoji/25fd.svg" />',
      );
      expect(emojify('▪️')).toEqual(
        '<img draggable="false" class="emojione" alt="▪️" title=":black_small_square:" src="/packs/emoji/25aa.svg" />',
      );
      expect(emojify('▫️')).toEqual(
        '<img draggable="false" class="emojione" alt="▫️" title=":white_small_square:" src="/packs/emoji/25ab.svg" />',
      );
      expect(emojify('🔶')).toEqual(
        '<img draggable="false" class="emojione" alt="🔶" title=":large_orange_diamond:" src="/packs/emoji/1f536.svg" />',
      );
      expect(emojify('🔷')).toEqual(
        '<img draggable="false" class="emojione" alt="🔷" title=":large_blue_diamond:" src="/packs/emoji/1f537.svg" />',
      );
      expect(emojify('🔸')).toEqual(
        '<img draggable="false" class="emojione" alt="🔸" title=":small_orange_diamond:" src="/packs/emoji/1f538.svg" />',
      );
      expect(emojify('🔹')).toEqual(
        '<img draggable="false" class="emojione" alt="🔹" title=":small_blue_diamond:" src="/packs/emoji/1f539.svg" />',
      );
      expect(emojify('🔺')).toEqual(
        '<img draggable="false" class="emojione" alt="🔺" title=":small_red_triangle:" src="/packs/emoji/1f53a.svg" />',
      );
      expect(emojify('🔻')).toEqual(
        '<img draggable="false" class="emojione" alt="🔻" title=":small_red_triangle_down:" src="/packs/emoji/1f53b.svg" />',
      );
      expect(emojify('💠')).toEqual(
        '<img draggable="false" class="emojione" alt="💠" title=":diamond_shape_with_a_dot_inside:" src="/packs/emoji/1f4a0.svg" />',
      );
      expect(emojify('🔘')).toEqual(
        '<img draggable="false" class="emojione" alt="🔘" title=":radio_button:" src="/packs/emoji/1f518.svg" />',
      );
      expect(emojify('🔳')).toEqual(
        '<img draggable="false" class="emojione" alt="🔳" title=":white_square_button:" src="/packs/emoji/1f533.svg" />',
      );
      expect(emojify('🔲')).toEqual(
        '<img draggable="false" class="emojione" alt="🔲" title=":black_square_button:" src="/packs/emoji/1f532.svg" />',
      );
      expect(emojify('🏁')).toEqual(
        '<img draggable="false" class="emojione" alt="🏁" title=":checkered_flag:" src="/packs/emoji/1f3c1.svg" />',
      );
      expect(emojify('🚩')).toEqual(
        '<img draggable="false" class="emojione" alt="🚩" title=":triangular_flag_on_post:" src="/packs/emoji/1f6a9.svg" />',
      );
      expect(emojify('🎌')).toEqual(
        '<img draggable="false" class="emojione" alt="🎌" title=":crossed_flags:" src="/packs/emoji/1f38c.svg" />',
      );
      expect(emojify('🏴')).toEqual(
        '<img draggable="false" class="emojione" alt="🏴" title=":waving_black_flag:" src="/packs/emoji/1f3f4.svg" />',
      );
      expect(emojify('🏳️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏳️" title=":waving_white_flag:" src="/packs/emoji/1f3f3.svg" />',
      );
      expect(emojify('🏳️‍🌈')).toEqual(
        '<img draggable="false" class="emojione" alt="🏳️‍🌈" title=":rainbow-flag:" src="/packs/emoji/1f3f3-fe0f-200d-1f308.svg" />',
      );
      expect(emojify('🏳️‍⚧️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏳️‍⚧️" title=":transgender_flag:" src="/packs/emoji/1f3f3-fe0f-200d-26a7-fe0f.svg" />',
      );
      expect(emojify('🏴‍☠️')).toEqual(
        '<img draggable="false" class="emojione" alt="🏴‍☠️" title=":pirate_flag:" src="/packs/emoji/1f3f4-200d-2620-fe0f.svg" />',
      );
      expect(emojify('🇦🇨')).toEqual(
        '<img draggable="false" class="emojione" alt="🇦🇨" title=":flag-ac:" src="/packs/emoji/1f1e6-1f1e8.svg" />',
      );
      expect(emojify('🇦🇩')).toEqual(
        '<img draggable="false" class="emojione" alt="🇦🇩" title=":flag-ad:" src="/packs/emoji/1f1e6-1f1e9.svg" />',
      );
      expect(emojify('🇦🇪')).toEqual(
        '<img draggable="false" class="emojione" alt="🇦🇪" title=":flag-ae:" src="/packs/emoji/1f1e6-1f1ea.svg" />',
      );
      expect(emojify('🇦🇫')).toEqual(
        '<img draggable="false" class="emojione" alt="🇦🇫" title=":flag-af:" src="/packs/emoji/1f1e6-1f1eb.svg" />',
      );
      expect(emojify('🇦🇬')).toEqual(
        '<img draggable="false" class="emojione" alt="🇦🇬" title=":flag-ag:" src="/packs/emoji/1f1e6-1f1ec.svg" />',
      );
      expect(emojify('🇦🇮')).toEqual(
        '<img draggable="false" class="emojione" alt="🇦🇮" title=":flag-ai:" src="/packs/emoji/1f1e6-1f1ee.svg" />',
      );
      expect(emojify('🇦🇱')).toEqual(
        '<img draggable="false" class="emojione" alt="🇦🇱" title=":flag-al:" src="/packs/emoji/1f1e6-1f1f1.svg" />',
      );
      expect(emojify('🇦🇲')).toEqual(
        '<img draggable="false" class="emojione" alt="🇦🇲" title=":flag-am:" src="/packs/emoji/1f1e6-1f1f2.svg" />',
      );
      expect(emojify('🇦🇴')).toEqual(
        '<img draggable="false" class="emojione" alt="🇦🇴" title=":flag-ao:" src="/packs/emoji/1f1e6-1f1f4.svg" />',
      );
      expect(emojify('🇦🇶')).toEqual(
        '<img draggable="false" class="emojione" alt="🇦🇶" title=":flag-aq:" src="/packs/emoji/1f1e6-1f1f6.svg" />',
      );
      expect(emojify('🇦🇷')).toEqual(
        '<img draggable="false" class="emojione" alt="🇦🇷" title=":flag-ar:" src="/packs/emoji/1f1e6-1f1f7.svg" />',
      );
      expect(emojify('🇦🇸')).toEqual(
        '<img draggable="false" class="emojione" alt="🇦🇸" title=":flag-as:" src="/packs/emoji/1f1e6-1f1f8.svg" />',
      );
      expect(emojify('🇦🇹')).toEqual(
        '<img draggable="false" class="emojione" alt="🇦🇹" title=":flag-at:" src="/packs/emoji/1f1e6-1f1f9.svg" />',
      );
      expect(emojify('🇦🇺')).toEqual(
        '<img draggable="false" class="emojione" alt="🇦🇺" title=":flag-au:" src="/packs/emoji/1f1e6-1f1fa.svg" />',
      );
      expect(emojify('🇦🇼')).toEqual(
        '<img draggable="false" class="emojione" alt="🇦🇼" title=":flag-aw:" src="/packs/emoji/1f1e6-1f1fc.svg" />',
      );
      expect(emojify('🇦🇽')).toEqual(
        '<img draggable="false" class="emojione" alt="🇦🇽" title=":flag-ax:" src="/packs/emoji/1f1e6-1f1fd.svg" />',
      );
      expect(emojify('🇦🇿')).toEqual(
        '<img draggable="false" class="emojione" alt="🇦🇿" title=":flag-az:" src="/packs/emoji/1f1e6-1f1ff.svg" />',
      );
      expect(emojify('🇧🇦')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇦" title=":flag-ba:" src="/packs/emoji/1f1e7-1f1e6.svg" />',
      );
      expect(emojify('🇧🇧')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇧" title=":flag-bb:" src="/packs/emoji/1f1e7-1f1e7.svg" />',
      );
      expect(emojify('🇧🇩')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇩" title=":flag-bd:" src="/packs/emoji/1f1e7-1f1e9.svg" />',
      );
      expect(emojify('🇧🇪')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇪" title=":flag-be:" src="/packs/emoji/1f1e7-1f1ea.svg" />',
      );
      expect(emojify('🇧🇫')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇫" title=":flag-bf:" src="/packs/emoji/1f1e7-1f1eb.svg" />',
      );
      expect(emojify('🇧🇬')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇬" title=":flag-bg:" src="/packs/emoji/1f1e7-1f1ec.svg" />',
      );
      expect(emojify('🇧🇭')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇭" title=":flag-bh:" src="/packs/emoji/1f1e7-1f1ed.svg" />',
      );
      expect(emojify('🇧🇮')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇮" title=":flag-bi:" src="/packs/emoji/1f1e7-1f1ee.svg" />',
      );
      expect(emojify('🇧🇯')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇯" title=":flag-bj:" src="/packs/emoji/1f1e7-1f1ef.svg" />',
      );
      expect(emojify('🇧🇱')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇱" title=":flag-bl:" src="/packs/emoji/1f1e7-1f1f1.svg" />',
      );
      expect(emojify('🇧🇲')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇲" title=":flag-bm:" src="/packs/emoji/1f1e7-1f1f2.svg" />',
      );
      expect(emojify('🇧🇳')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇳" title=":flag-bn:" src="/packs/emoji/1f1e7-1f1f3.svg" />',
      );
      expect(emojify('🇧🇴')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇴" title=":flag-bo:" src="/packs/emoji/1f1e7-1f1f4.svg" />',
      );
      expect(emojify('🇧🇶')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇶" title=":flag-bq:" src="/packs/emoji/1f1e7-1f1f6.svg" />',
      );
      expect(emojify('🇧🇷')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇷" title=":flag-br:" src="/packs/emoji/1f1e7-1f1f7.svg" />',
      );
      expect(emojify('🇧🇸')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇸" title=":flag-bs:" src="/packs/emoji/1f1e7-1f1f8.svg" />',
      );
      expect(emojify('🇧🇹')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇹" title=":flag-bt:" src="/packs/emoji/1f1e7-1f1f9.svg" />',
      );
      expect(emojify('🇧🇻')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇻" title=":flag-bv:" src="/packs/emoji/1f1e7-1f1fb.svg" />',
      );
      expect(emojify('🇧🇼')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇼" title=":flag-bw:" src="/packs/emoji/1f1e7-1f1fc.svg" />',
      );
      expect(emojify('🇧🇾')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇾" title=":flag-by:" src="/packs/emoji/1f1e7-1f1fe.svg" />',
      );
      expect(emojify('🇧🇿')).toEqual(
        '<img draggable="false" class="emojione" alt="🇧🇿" title=":flag-bz:" src="/packs/emoji/1f1e7-1f1ff.svg" />',
      );
      expect(emojify('🇨🇦')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇦" title=":flag-ca:" src="/packs/emoji/1f1e8-1f1e6.svg" />',
      );
      expect(emojify('🇨🇨')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇨" title=":flag-cc:" src="/packs/emoji/1f1e8-1f1e8.svg" />',
      );
      expect(emojify('🇨🇩')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇩" title=":flag-cd:" src="/packs/emoji/1f1e8-1f1e9.svg" />',
      );
      expect(emojify('🇨🇫')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇫" title=":flag-cf:" src="/packs/emoji/1f1e8-1f1eb.svg" />',
      );
      expect(emojify('🇨🇬')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇬" title=":flag-cg:" src="/packs/emoji/1f1e8-1f1ec.svg" />',
      );
      expect(emojify('🇨🇭')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇭" title=":flag-ch:" src="/packs/emoji/1f1e8-1f1ed.svg" />',
      );
      expect(emojify('🇨🇮')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇮" title=":flag-ci:" src="/packs/emoji/1f1e8-1f1ee.svg" />',
      );
      expect(emojify('🇨🇰')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇰" title=":flag-ck:" src="/packs/emoji/1f1e8-1f1f0.svg" />',
      );
      expect(emojify('🇨🇱')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇱" title=":flag-cl:" src="/packs/emoji/1f1e8-1f1f1.svg" />',
      );
      expect(emojify('🇨🇲')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇲" title=":flag-cm:" src="/packs/emoji/1f1e8-1f1f2.svg" />',
      );
      expect(emojify('🇨🇳')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇳" title=":cn:" src="/packs/emoji/1f1e8-1f1f3.svg" />',
      );
      expect(emojify('🇨🇴')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇴" title=":flag-co:" src="/packs/emoji/1f1e8-1f1f4.svg" />',
      );
      expect(emojify('🇨🇵')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇵" title=":flag-cp:" src="/packs/emoji/1f1e8-1f1f5.svg" />',
      );
      expect(emojify('🇨🇷')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇷" title=":flag-cr:" src="/packs/emoji/1f1e8-1f1f7.svg" />',
      );
      expect(emojify('🇨🇺')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇺" title=":flag-cu:" src="/packs/emoji/1f1e8-1f1fa.svg" />',
      );
      expect(emojify('🇨🇻')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇻" title=":flag-cv:" src="/packs/emoji/1f1e8-1f1fb.svg" />',
      );
      expect(emojify('🇨🇼')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇼" title=":flag-cw:" src="/packs/emoji/1f1e8-1f1fc.svg" />',
      );
      expect(emojify('🇨🇽')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇽" title=":flag-cx:" src="/packs/emoji/1f1e8-1f1fd.svg" />',
      );
      expect(emojify('🇨🇾')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇾" title=":flag-cy:" src="/packs/emoji/1f1e8-1f1fe.svg" />',
      );
      expect(emojify('🇨🇿')).toEqual(
        '<img draggable="false" class="emojione" alt="🇨🇿" title=":flag-cz:" src="/packs/emoji/1f1e8-1f1ff.svg" />',
      );
      expect(emojify('🇩🇪')).toEqual(
        '<img draggable="false" class="emojione" alt="🇩🇪" title=":de:" src="/packs/emoji/1f1e9-1f1ea.svg" />',
      );
      expect(emojify('🇩🇬')).toEqual(
        '<img draggable="false" class="emojione" alt="🇩🇬" title=":flag-dg:" src="/packs/emoji/1f1e9-1f1ec.svg" />',
      );
      expect(emojify('🇩🇯')).toEqual(
        '<img draggable="false" class="emojione" alt="🇩🇯" title=":flag-dj:" src="/packs/emoji/1f1e9-1f1ef.svg" />',
      );
      expect(emojify('🇩🇰')).toEqual(
        '<img draggable="false" class="emojione" alt="🇩🇰" title=":flag-dk:" src="/packs/emoji/1f1e9-1f1f0.svg" />',
      );
      expect(emojify('🇩🇲')).toEqual(
        '<img draggable="false" class="emojione" alt="🇩🇲" title=":flag-dm:" src="/packs/emoji/1f1e9-1f1f2.svg" />',
      );
      expect(emojify('🇩🇴')).toEqual(
        '<img draggable="false" class="emojione" alt="🇩🇴" title=":flag-do:" src="/packs/emoji/1f1e9-1f1f4.svg" />',
      );
      expect(emojify('🇩🇿')).toEqual(
        '<img draggable="false" class="emojione" alt="🇩🇿" title=":flag-dz:" src="/packs/emoji/1f1e9-1f1ff.svg" />',
      );
      expect(emojify('🇪🇦')).toEqual(
        '<img draggable="false" class="emojione" alt="🇪🇦" title=":flag-ea:" src="/packs/emoji/1f1ea-1f1e6.svg" />',
      );
      expect(emojify('🇪🇨')).toEqual(
        '<img draggable="false" class="emojione" alt="🇪🇨" title=":flag-ec:" src="/packs/emoji/1f1ea-1f1e8.svg" />',
      );
      expect(emojify('🇪🇪')).toEqual(
        '<img draggable="false" class="emojione" alt="🇪🇪" title=":flag-ee:" src="/packs/emoji/1f1ea-1f1ea.svg" />',
      );
      expect(emojify('🇪🇬')).toEqual(
        '<img draggable="false" class="emojione" alt="🇪🇬" title=":flag-eg:" src="/packs/emoji/1f1ea-1f1ec.svg" />',
      );
      expect(emojify('🇪🇭')).toEqual(
        '<img draggable="false" class="emojione" alt="🇪🇭" title=":flag-eh:" src="/packs/emoji/1f1ea-1f1ed.svg" />',
      );
      expect(emojify('🇪🇷')).toEqual(
        '<img draggable="false" class="emojione" alt="🇪🇷" title=":flag-er:" src="/packs/emoji/1f1ea-1f1f7.svg" />',
      );
      expect(emojify('🇪🇸')).toEqual(
        '<img draggable="false" class="emojione" alt="🇪🇸" title=":es:" src="/packs/emoji/1f1ea-1f1f8.svg" />',
      );
      expect(emojify('🇪🇹')).toEqual(
        '<img draggable="false" class="emojione" alt="🇪🇹" title=":flag-et:" src="/packs/emoji/1f1ea-1f1f9.svg" />',
      );
      expect(emojify('🇪🇺')).toEqual(
        '<img draggable="false" class="emojione" alt="🇪🇺" title=":flag-eu:" src="/packs/emoji/1f1ea-1f1fa.svg" />',
      );
      expect(emojify('🇫🇮')).toEqual(
        '<img draggable="false" class="emojione" alt="🇫🇮" title=":flag-fi:" src="/packs/emoji/1f1eb-1f1ee.svg" />',
      );
      expect(emojify('🇫🇯')).toEqual(
        '<img draggable="false" class="emojione" alt="🇫🇯" title=":flag-fj:" src="/packs/emoji/1f1eb-1f1ef.svg" />',
      );
      expect(emojify('🇫🇰')).toEqual(
        '<img draggable="false" class="emojione" alt="🇫🇰" title=":flag-fk:" src="/packs/emoji/1f1eb-1f1f0.svg" />',
      );
      expect(emojify('🇫🇲')).toEqual(
        '<img draggable="false" class="emojione" alt="🇫🇲" title=":flag-fm:" src="/packs/emoji/1f1eb-1f1f2.svg" />',
      );
      expect(emojify('🇫🇴')).toEqual(
        '<img draggable="false" class="emojione" alt="🇫🇴" title=":flag-fo:" src="/packs/emoji/1f1eb-1f1f4.svg" />',
      );
      expect(emojify('🇫🇷')).toEqual(
        '<img draggable="false" class="emojione" alt="🇫🇷" title=":fr:" src="/packs/emoji/1f1eb-1f1f7.svg" />',
      );
      expect(emojify('🇬🇦')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇦" title=":flag-ga:" src="/packs/emoji/1f1ec-1f1e6.svg" />',
      );
      expect(emojify('🇬🇧')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇧" title=":gb:" src="/packs/emoji/1f1ec-1f1e7.svg" />',
      );
      expect(emojify('🇬🇩')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇩" title=":flag-gd:" src="/packs/emoji/1f1ec-1f1e9.svg" />',
      );
      expect(emojify('🇬🇪')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇪" title=":flag-ge:" src="/packs/emoji/1f1ec-1f1ea.svg" />',
      );
      expect(emojify('🇬🇫')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇫" title=":flag-gf:" src="/packs/emoji/1f1ec-1f1eb.svg" />',
      );
      expect(emojify('🇬🇬')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇬" title=":flag-gg:" src="/packs/emoji/1f1ec-1f1ec.svg" />',
      );
      expect(emojify('🇬🇭')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇭" title=":flag-gh:" src="/packs/emoji/1f1ec-1f1ed.svg" />',
      );
      expect(emojify('🇬🇮')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇮" title=":flag-gi:" src="/packs/emoji/1f1ec-1f1ee.svg" />',
      );
      expect(emojify('🇬🇱')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇱" title=":flag-gl:" src="/packs/emoji/1f1ec-1f1f1.svg" />',
      );
      expect(emojify('🇬🇲')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇲" title=":flag-gm:" src="/packs/emoji/1f1ec-1f1f2.svg" />',
      );
      expect(emojify('🇬🇳')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇳" title=":flag-gn:" src="/packs/emoji/1f1ec-1f1f3.svg" />',
      );
      expect(emojify('🇬🇵')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇵" title=":flag-gp:" src="/packs/emoji/1f1ec-1f1f5.svg" />',
      );
      expect(emojify('🇬🇶')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇶" title=":flag-gq:" src="/packs/emoji/1f1ec-1f1f6.svg" />',
      );
      expect(emojify('🇬🇷')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇷" title=":flag-gr:" src="/packs/emoji/1f1ec-1f1f7.svg" />',
      );
      expect(emojify('🇬🇸')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇸" title=":flag-gs:" src="/packs/emoji/1f1ec-1f1f8.svg" />',
      );
      expect(emojify('🇬🇹')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇹" title=":flag-gt:" src="/packs/emoji/1f1ec-1f1f9.svg" />',
      );
      expect(emojify('🇬🇺')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇺" title=":flag-gu:" src="/packs/emoji/1f1ec-1f1fa.svg" />',
      );
      expect(emojify('🇬🇼')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇼" title=":flag-gw:" src="/packs/emoji/1f1ec-1f1fc.svg" />',
      );
      expect(emojify('🇬🇾')).toEqual(
        '<img draggable="false" class="emojione" alt="🇬🇾" title=":flag-gy:" src="/packs/emoji/1f1ec-1f1fe.svg" />',
      );
      expect(emojify('🇭🇰')).toEqual(
        '<img draggable="false" class="emojione" alt="🇭🇰" title=":flag-hk:" src="/packs/emoji/1f1ed-1f1f0.svg" />',
      );
      expect(emojify('🇭🇲')).toEqual(
        '<img draggable="false" class="emojione" alt="🇭🇲" title=":flag-hm:" src="/packs/emoji/1f1ed-1f1f2.svg" />',
      );
      expect(emojify('🇭🇳')).toEqual(
        '<img draggable="false" class="emojione" alt="🇭🇳" title=":flag-hn:" src="/packs/emoji/1f1ed-1f1f3.svg" />',
      );
      expect(emojify('🇭🇷')).toEqual(
        '<img draggable="false" class="emojione" alt="🇭🇷" title=":flag-hr:" src="/packs/emoji/1f1ed-1f1f7.svg" />',
      );
      expect(emojify('🇭🇹')).toEqual(
        '<img draggable="false" class="emojione" alt="🇭🇹" title=":flag-ht:" src="/packs/emoji/1f1ed-1f1f9.svg" />',
      );
      expect(emojify('🇭🇺')).toEqual(
        '<img draggable="false" class="emojione" alt="🇭🇺" title=":flag-hu:" src="/packs/emoji/1f1ed-1f1fa.svg" />',
      );
      expect(emojify('🇮🇨')).toEqual(
        '<img draggable="false" class="emojione" alt="🇮🇨" title=":flag-ic:" src="/packs/emoji/1f1ee-1f1e8.svg" />',
      );
      expect(emojify('🇮🇩')).toEqual(
        '<img draggable="false" class="emojione" alt="🇮🇩" title=":flag-id:" src="/packs/emoji/1f1ee-1f1e9.svg" />',
      );
      expect(emojify('🇮🇪')).toEqual(
        '<img draggable="false" class="emojione" alt="🇮🇪" title=":flag-ie:" src="/packs/emoji/1f1ee-1f1ea.svg" />',
      );
      expect(emojify('🇮🇱')).toEqual(
        '<img draggable="false" class="emojione" alt="🇮🇱" title=":flag-il:" src="/packs/emoji/1f1ee-1f1f1.svg" />',
      );
      expect(emojify('🇮🇲')).toEqual(
        '<img draggable="false" class="emojione" alt="🇮🇲" title=":flag-im:" src="/packs/emoji/1f1ee-1f1f2.svg" />',
      );
      expect(emojify('🇮🇳')).toEqual(
        '<img draggable="false" class="emojione" alt="🇮🇳" title=":flag-in:" src="/packs/emoji/1f1ee-1f1f3.svg" />',
      );
      expect(emojify('🇮🇴')).toEqual(
        '<img draggable="false" class="emojione" alt="🇮🇴" title=":flag-io:" src="/packs/emoji/1f1ee-1f1f4.svg" />',
      );
      expect(emojify('🇮🇶')).toEqual(
        '<img draggable="false" class="emojione" alt="🇮🇶" title=":flag-iq:" src="/packs/emoji/1f1ee-1f1f6.svg" />',
      );
      expect(emojify('🇮🇷')).toEqual(
        '<img draggable="false" class="emojione" alt="🇮🇷" title=":flag-ir:" src="/packs/emoji/1f1ee-1f1f7.svg" />',
      );
      expect(emojify('🇮🇸')).toEqual(
        '<img draggable="false" class="emojione" alt="🇮🇸" title=":flag-is:" src="/packs/emoji/1f1ee-1f1f8.svg" />',
      );
      expect(emojify('🇮🇹')).toEqual(
        '<img draggable="false" class="emojione" alt="🇮🇹" title=":it:" src="/packs/emoji/1f1ee-1f1f9.svg" />',
      );
      expect(emojify('🇯🇪')).toEqual(
        '<img draggable="false" class="emojione" alt="🇯🇪" title=":flag-je:" src="/packs/emoji/1f1ef-1f1ea.svg" />',
      );
      expect(emojify('🇯🇲')).toEqual(
        '<img draggable="false" class="emojione" alt="🇯🇲" title=":flag-jm:" src="/packs/emoji/1f1ef-1f1f2.svg" />',
      );
      expect(emojify('🇯🇴')).toEqual(
        '<img draggable="false" class="emojione" alt="🇯🇴" title=":flag-jo:" src="/packs/emoji/1f1ef-1f1f4.svg" />',
      );
      expect(emojify('🇯🇵')).toEqual(
        '<img draggable="false" class="emojione" alt="🇯🇵" title=":jp:" src="/packs/emoji/1f1ef-1f1f5.svg" />',
      );
      expect(emojify('🇰🇪')).toEqual(
        '<img draggable="false" class="emojione" alt="🇰🇪" title=":flag-ke:" src="/packs/emoji/1f1f0-1f1ea.svg" />',
      );
      expect(emojify('🇰🇬')).toEqual(
        '<img draggable="false" class="emojione" alt="🇰🇬" title=":flag-kg:" src="/packs/emoji/1f1f0-1f1ec.svg" />',
      );
      expect(emojify('🇰🇭')).toEqual(
        '<img draggable="false" class="emojione" alt="🇰🇭" title=":flag-kh:" src="/packs/emoji/1f1f0-1f1ed.svg" />',
      );
      expect(emojify('🇰🇮')).toEqual(
        '<img draggable="false" class="emojione" alt="🇰🇮" title=":flag-ki:" src="/packs/emoji/1f1f0-1f1ee.svg" />',
      );
      expect(emojify('🇰🇲')).toEqual(
        '<img draggable="false" class="emojione" alt="🇰🇲" title=":flag-km:" src="/packs/emoji/1f1f0-1f1f2.svg" />',
      );
      expect(emojify('🇰🇳')).toEqual(
        '<img draggable="false" class="emojione" alt="🇰🇳" title=":flag-kn:" src="/packs/emoji/1f1f0-1f1f3.svg" />',
      );
      expect(emojify('🇰🇵')).toEqual(
        '<img draggable="false" class="emojione" alt="🇰🇵" title=":flag-kp:" src="/packs/emoji/1f1f0-1f1f5.svg" />',
      );
      expect(emojify('🇰🇷')).toEqual(
        '<img draggable="false" class="emojione" alt="🇰🇷" title=":kr:" src="/packs/emoji/1f1f0-1f1f7.svg" />',
      );
      expect(emojify('🇰🇼')).toEqual(
        '<img draggable="false" class="emojione" alt="🇰🇼" title=":flag-kw:" src="/packs/emoji/1f1f0-1f1fc.svg" />',
      );
      expect(emojify('🇰🇾')).toEqual(
        '<img draggable="false" class="emojione" alt="🇰🇾" title=":flag-ky:" src="/packs/emoji/1f1f0-1f1fe.svg" />',
      );
      expect(emojify('🇰🇿')).toEqual(
        '<img draggable="false" class="emojione" alt="🇰🇿" title=":flag-kz:" src="/packs/emoji/1f1f0-1f1ff.svg" />',
      );
      expect(emojify('🇱🇦')).toEqual(
        '<img draggable="false" class="emojione" alt="🇱🇦" title=":flag-la:" src="/packs/emoji/1f1f1-1f1e6.svg" />',
      );
      expect(emojify('🇱🇧')).toEqual(
        '<img draggable="false" class="emojione" alt="🇱🇧" title=":flag-lb:" src="/packs/emoji/1f1f1-1f1e7.svg" />',
      );
      expect(emojify('🇱🇨')).toEqual(
        '<img draggable="false" class="emojione" alt="🇱🇨" title=":flag-lc:" src="/packs/emoji/1f1f1-1f1e8.svg" />',
      );
      expect(emojify('🇱🇮')).toEqual(
        '<img draggable="false" class="emojione" alt="🇱🇮" title=":flag-li:" src="/packs/emoji/1f1f1-1f1ee.svg" />',
      );
      expect(emojify('🇱🇰')).toEqual(
        '<img draggable="false" class="emojione" alt="🇱🇰" title=":flag-lk:" src="/packs/emoji/1f1f1-1f1f0.svg" />',
      );
      expect(emojify('🇱🇷')).toEqual(
        '<img draggable="false" class="emojione" alt="🇱🇷" title=":flag-lr:" src="/packs/emoji/1f1f1-1f1f7.svg" />',
      );
      expect(emojify('🇱🇸')).toEqual(
        '<img draggable="false" class="emojione" alt="🇱🇸" title=":flag-ls:" src="/packs/emoji/1f1f1-1f1f8.svg" />',
      );
      expect(emojify('🇱🇹')).toEqual(
        '<img draggable="false" class="emojione" alt="🇱🇹" title=":flag-lt:" src="/packs/emoji/1f1f1-1f1f9.svg" />',
      );
      expect(emojify('🇱🇺')).toEqual(
        '<img draggable="false" class="emojione" alt="🇱🇺" title=":flag-lu:" src="/packs/emoji/1f1f1-1f1fa.svg" />',
      );
      expect(emojify('🇱🇻')).toEqual(
        '<img draggable="false" class="emojione" alt="🇱🇻" title=":flag-lv:" src="/packs/emoji/1f1f1-1f1fb.svg" />',
      );
      expect(emojify('🇱🇾')).toEqual(
        '<img draggable="false" class="emojione" alt="🇱🇾" title=":flag-ly:" src="/packs/emoji/1f1f1-1f1fe.svg" />',
      );
      expect(emojify('🇲🇦')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇦" title=":flag-ma:" src="/packs/emoji/1f1f2-1f1e6.svg" />',
      );
      expect(emojify('🇲🇨')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇨" title=":flag-mc:" src="/packs/emoji/1f1f2-1f1e8.svg" />',
      );
      expect(emojify('🇲🇩')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇩" title=":flag-md:" src="/packs/emoji/1f1f2-1f1e9.svg" />',
      );
      expect(emojify('🇲🇪')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇪" title=":flag-me:" src="/packs/emoji/1f1f2-1f1ea.svg" />',
      );
      expect(emojify('🇲🇫')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇫" title=":flag-mf:" src="/packs/emoji/1f1f2-1f1eb.svg" />',
      );
      expect(emojify('🇲🇬')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇬" title=":flag-mg:" src="/packs/emoji/1f1f2-1f1ec.svg" />',
      );
      expect(emojify('🇲🇭')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇭" title=":flag-mh:" src="/packs/emoji/1f1f2-1f1ed.svg" />',
      );
      expect(emojify('🇲🇰')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇰" title=":flag-mk:" src="/packs/emoji/1f1f2-1f1f0.svg" />',
      );
      expect(emojify('🇲🇱')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇱" title=":flag-ml:" src="/packs/emoji/1f1f2-1f1f1.svg" />',
      );
      expect(emojify('🇲🇲')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇲" title=":flag-mm:" src="/packs/emoji/1f1f2-1f1f2.svg" />',
      );
      expect(emojify('🇲🇳')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇳" title=":flag-mn:" src="/packs/emoji/1f1f2-1f1f3.svg" />',
      );
      expect(emojify('🇲🇴')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇴" title=":flag-mo:" src="/packs/emoji/1f1f2-1f1f4.svg" />',
      );
      expect(emojify('🇲🇵')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇵" title=":flag-mp:" src="/packs/emoji/1f1f2-1f1f5.svg" />',
      );
      expect(emojify('🇲🇶')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇶" title=":flag-mq:" src="/packs/emoji/1f1f2-1f1f6.svg" />',
      );
      expect(emojify('🇲🇷')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇷" title=":flag-mr:" src="/packs/emoji/1f1f2-1f1f7.svg" />',
      );
      expect(emojify('🇲🇸')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇸" title=":flag-ms:" src="/packs/emoji/1f1f2-1f1f8.svg" />',
      );
      expect(emojify('🇲🇹')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇹" title=":flag-mt:" src="/packs/emoji/1f1f2-1f1f9.svg" />',
      );
      expect(emojify('🇲🇺')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇺" title=":flag-mu:" src="/packs/emoji/1f1f2-1f1fa.svg" />',
      );
      expect(emojify('🇲🇻')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇻" title=":flag-mv:" src="/packs/emoji/1f1f2-1f1fb.svg" />',
      );
      expect(emojify('🇲🇼')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇼" title=":flag-mw:" src="/packs/emoji/1f1f2-1f1fc.svg" />',
      );
      expect(emojify('🇲🇽')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇽" title=":flag-mx:" src="/packs/emoji/1f1f2-1f1fd.svg" />',
      );
      expect(emojify('🇲🇾')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇾" title=":flag-my:" src="/packs/emoji/1f1f2-1f1fe.svg" />',
      );
      expect(emojify('🇲🇿')).toEqual(
        '<img draggable="false" class="emojione" alt="🇲🇿" title=":flag-mz:" src="/packs/emoji/1f1f2-1f1ff.svg" />',
      );
      expect(emojify('🇳🇦')).toEqual(
        '<img draggable="false" class="emojione" alt="🇳🇦" title=":flag-na:" src="/packs/emoji/1f1f3-1f1e6.svg" />',
      );
      expect(emojify('🇳🇨')).toEqual(
        '<img draggable="false" class="emojione" alt="🇳🇨" title=":flag-nc:" src="/packs/emoji/1f1f3-1f1e8.svg" />',
      );
      expect(emojify('🇳🇪')).toEqual(
        '<img draggable="false" class="emojione" alt="🇳🇪" title=":flag-ne:" src="/packs/emoji/1f1f3-1f1ea.svg" />',
      );
      expect(emojify('🇳🇫')).toEqual(
        '<img draggable="false" class="emojione" alt="🇳🇫" title=":flag-nf:" src="/packs/emoji/1f1f3-1f1eb.svg" />',
      );
      expect(emojify('🇳🇬')).toEqual(
        '<img draggable="false" class="emojione" alt="🇳🇬" title=":flag-ng:" src="/packs/emoji/1f1f3-1f1ec.svg" />',
      );
      expect(emojify('🇳🇮')).toEqual(
        '<img draggable="false" class="emojione" alt="🇳🇮" title=":flag-ni:" src="/packs/emoji/1f1f3-1f1ee.svg" />',
      );
      expect(emojify('🇳🇱')).toEqual(
        '<img draggable="false" class="emojione" alt="🇳🇱" title=":flag-nl:" src="/packs/emoji/1f1f3-1f1f1.svg" />',
      );
      expect(emojify('🇳🇴')).toEqual(
        '<img draggable="false" class="emojione" alt="🇳🇴" title=":flag-no:" src="/packs/emoji/1f1f3-1f1f4.svg" />',
      );
      expect(emojify('🇳🇵')).toEqual(
        '<img draggable="false" class="emojione" alt="🇳🇵" title=":flag-np:" src="/packs/emoji/1f1f3-1f1f5.svg" />',
      );
      expect(emojify('🇳🇷')).toEqual(
        '<img draggable="false" class="emojione" alt="🇳🇷" title=":flag-nr:" src="/packs/emoji/1f1f3-1f1f7.svg" />',
      );
      expect(emojify('🇳🇺')).toEqual(
        '<img draggable="false" class="emojione" alt="🇳🇺" title=":flag-nu:" src="/packs/emoji/1f1f3-1f1fa.svg" />',
      );
      expect(emojify('🇳🇿')).toEqual(
        '<img draggable="false" class="emojione" alt="🇳🇿" title=":flag-nz:" src="/packs/emoji/1f1f3-1f1ff.svg" />',
      );
      expect(emojify('🇴🇲')).toEqual(
        '<img draggable="false" class="emojione" alt="🇴🇲" title=":flag-om:" src="/packs/emoji/1f1f4-1f1f2.svg" />',
      );
      expect(emojify('🇵🇦')).toEqual(
        '<img draggable="false" class="emojione" alt="🇵🇦" title=":flag-pa:" src="/packs/emoji/1f1f5-1f1e6.svg" />',
      );
      expect(emojify('🇵🇪')).toEqual(
        '<img draggable="false" class="emojione" alt="🇵🇪" title=":flag-pe:" src="/packs/emoji/1f1f5-1f1ea.svg" />',
      );
      expect(emojify('🇵🇫')).toEqual(
        '<img draggable="false" class="emojione" alt="🇵🇫" title=":flag-pf:" src="/packs/emoji/1f1f5-1f1eb.svg" />',
      );
      expect(emojify('🇵🇬')).toEqual(
        '<img draggable="false" class="emojione" alt="🇵🇬" title=":flag-pg:" src="/packs/emoji/1f1f5-1f1ec.svg" />',
      );
      expect(emojify('🇵🇭')).toEqual(
        '<img draggable="false" class="emojione" alt="🇵🇭" title=":flag-ph:" src="/packs/emoji/1f1f5-1f1ed.svg" />',
      );
      expect(emojify('🇵🇰')).toEqual(
        '<img draggable="false" class="emojione" alt="🇵🇰" title=":flag-pk:" src="/packs/emoji/1f1f5-1f1f0.svg" />',
      );
      expect(emojify('🇵🇱')).toEqual(
        '<img draggable="false" class="emojione" alt="🇵🇱" title=":flag-pl:" src="/packs/emoji/1f1f5-1f1f1.svg" />',
      );
      expect(emojify('🇵🇲')).toEqual(
        '<img draggable="false" class="emojione" alt="🇵🇲" title=":flag-pm:" src="/packs/emoji/1f1f5-1f1f2.svg" />',
      );
      expect(emojify('🇵🇳')).toEqual(
        '<img draggable="false" class="emojione" alt="🇵🇳" title=":flag-pn:" src="/packs/emoji/1f1f5-1f1f3.svg" />',
      );
      expect(emojify('🇵🇷')).toEqual(
        '<img draggable="false" class="emojione" alt="🇵🇷" title=":flag-pr:" src="/packs/emoji/1f1f5-1f1f7.svg" />',
      );
      expect(emojify('🇵🇸')).toEqual(
        '<img draggable="false" class="emojione" alt="🇵🇸" title=":flag-ps:" src="/packs/emoji/1f1f5-1f1f8.svg" />',
      );
      expect(emojify('🇵🇹')).toEqual(
        '<img draggable="false" class="emojione" alt="🇵🇹" title=":flag-pt:" src="/packs/emoji/1f1f5-1f1f9.svg" />',
      );
      expect(emojify('🇵🇼')).toEqual(
        '<img draggable="false" class="emojione" alt="🇵🇼" title=":flag-pw:" src="/packs/emoji/1f1f5-1f1fc.svg" />',
      );
      expect(emojify('🇵🇾')).toEqual(
        '<img draggable="false" class="emojione" alt="🇵🇾" title=":flag-py:" src="/packs/emoji/1f1f5-1f1fe.svg" />',
      );
      expect(emojify('🇶🇦')).toEqual(
        '<img draggable="false" class="emojione" alt="🇶🇦" title=":flag-qa:" src="/packs/emoji/1f1f6-1f1e6.svg" />',
      );
      expect(emojify('🇷🇪')).toEqual(
        '<img draggable="false" class="emojione" alt="🇷🇪" title=":flag-re:" src="/packs/emoji/1f1f7-1f1ea.svg" />',
      );
      expect(emojify('🇷🇴')).toEqual(
        '<img draggable="false" class="emojione" alt="🇷🇴" title=":flag-ro:" src="/packs/emoji/1f1f7-1f1f4.svg" />',
      );
      expect(emojify('🇷🇸')).toEqual(
        '<img draggable="false" class="emojione" alt="🇷🇸" title=":flag-rs:" src="/packs/emoji/1f1f7-1f1f8.svg" />',
      );
      expect(emojify('🇷🇺')).toEqual(
        '<img draggable="false" class="emojione" alt="🇷🇺" title=":ru:" src="/packs/emoji/1f1f7-1f1fa.svg" />',
      );
      expect(emojify('🇷🇼')).toEqual(
        '<img draggable="false" class="emojione" alt="🇷🇼" title=":flag-rw:" src="/packs/emoji/1f1f7-1f1fc.svg" />',
      );
      expect(emojify('🇸🇦')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇦" title=":flag-sa:" src="/packs/emoji/1f1f8-1f1e6.svg" />',
      );
      expect(emojify('🇸🇧')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇧" title=":flag-sb:" src="/packs/emoji/1f1f8-1f1e7.svg" />',
      );
      expect(emojify('🇸🇨')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇨" title=":flag-sc:" src="/packs/emoji/1f1f8-1f1e8.svg" />',
      );
      expect(emojify('🇸🇩')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇩" title=":flag-sd:" src="/packs/emoji/1f1f8-1f1e9.svg" />',
      );
      expect(emojify('🇸🇪')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇪" title=":flag-se:" src="/packs/emoji/1f1f8-1f1ea.svg" />',
      );
      expect(emojify('🇸🇬')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇬" title=":flag-sg:" src="/packs/emoji/1f1f8-1f1ec.svg" />',
      );
      expect(emojify('🇸🇭')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇭" title=":flag-sh:" src="/packs/emoji/1f1f8-1f1ed.svg" />',
      );
      expect(emojify('🇸🇮')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇮" title=":flag-si:" src="/packs/emoji/1f1f8-1f1ee.svg" />',
      );
      expect(emojify('🇸🇯')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇯" title=":flag-sj:" src="/packs/emoji/1f1f8-1f1ef.svg" />',
      );
      expect(emojify('🇸🇰')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇰" title=":flag-sk:" src="/packs/emoji/1f1f8-1f1f0.svg" />',
      );
      expect(emojify('🇸🇱')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇱" title=":flag-sl:" src="/packs/emoji/1f1f8-1f1f1.svg" />',
      );
      expect(emojify('🇸🇲')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇲" title=":flag-sm:" src="/packs/emoji/1f1f8-1f1f2.svg" />',
      );
      expect(emojify('🇸🇳')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇳" title=":flag-sn:" src="/packs/emoji/1f1f8-1f1f3.svg" />',
      );
      expect(emojify('🇸🇴')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇴" title=":flag-so:" src="/packs/emoji/1f1f8-1f1f4.svg" />',
      );
      expect(emojify('🇸🇷')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇷" title=":flag-sr:" src="/packs/emoji/1f1f8-1f1f7.svg" />',
      );
      expect(emojify('🇸🇸')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇸" title=":flag-ss:" src="/packs/emoji/1f1f8-1f1f8.svg" />',
      );
      expect(emojify('🇸🇹')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇹" title=":flag-st:" src="/packs/emoji/1f1f8-1f1f9.svg" />',
      );
      expect(emojify('🇸🇻')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇻" title=":flag-sv:" src="/packs/emoji/1f1f8-1f1fb.svg" />',
      );
      expect(emojify('🇸🇽')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇽" title=":flag-sx:" src="/packs/emoji/1f1f8-1f1fd.svg" />',
      );
      expect(emojify('🇸🇾')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇾" title=":flag-sy:" src="/packs/emoji/1f1f8-1f1fe.svg" />',
      );
      expect(emojify('🇸🇿')).toEqual(
        '<img draggable="false" class="emojione" alt="🇸🇿" title=":flag-sz:" src="/packs/emoji/1f1f8-1f1ff.svg" />',
      );
      expect(emojify('🇹🇦')).toEqual(
        '<img draggable="false" class="emojione" alt="🇹🇦" title=":flag-ta:" src="/packs/emoji/1f1f9-1f1e6.svg" />',
      );
      expect(emojify('🇹🇨')).toEqual(
        '<img draggable="false" class="emojione" alt="🇹🇨" title=":flag-tc:" src="/packs/emoji/1f1f9-1f1e8.svg" />',
      );
      expect(emojify('🇹🇩')).toEqual(
        '<img draggable="false" class="emojione" alt="🇹🇩" title=":flag-td:" src="/packs/emoji/1f1f9-1f1e9.svg" />',
      );
      expect(emojify('🇹🇫')).toEqual(
        '<img draggable="false" class="emojione" alt="🇹🇫" title=":flag-tf:" src="/packs/emoji/1f1f9-1f1eb.svg" />',
      );
      expect(emojify('🇹🇬')).toEqual(
        '<img draggable="false" class="emojione" alt="🇹🇬" title=":flag-tg:" src="/packs/emoji/1f1f9-1f1ec.svg" />',
      );
      expect(emojify('🇹🇭')).toEqual(
        '<img draggable="false" class="emojione" alt="🇹🇭" title=":flag-th:" src="/packs/emoji/1f1f9-1f1ed.svg" />',
      );
      expect(emojify('🇹🇯')).toEqual(
        '<img draggable="false" class="emojione" alt="🇹🇯" title=":flag-tj:" src="/packs/emoji/1f1f9-1f1ef.svg" />',
      );
      expect(emojify('🇹🇰')).toEqual(
        '<img draggable="false" class="emojione" alt="🇹🇰" title=":flag-tk:" src="/packs/emoji/1f1f9-1f1f0.svg" />',
      );
      expect(emojify('🇹🇱')).toEqual(
        '<img draggable="false" class="emojione" alt="🇹🇱" title=":flag-tl:" src="/packs/emoji/1f1f9-1f1f1.svg" />',
      );
      expect(emojify('🇹🇲')).toEqual(
        '<img draggable="false" class="emojione" alt="🇹🇲" title=":flag-tm:" src="/packs/emoji/1f1f9-1f1f2.svg" />',
      );
      expect(emojify('🇹🇳')).toEqual(
        '<img draggable="false" class="emojione" alt="🇹🇳" title=":flag-tn:" src="/packs/emoji/1f1f9-1f1f3.svg" />',
      );
      expect(emojify('🇹🇴')).toEqual(
        '<img draggable="false" class="emojione" alt="🇹🇴" title=":flag-to:" src="/packs/emoji/1f1f9-1f1f4.svg" />',
      );
      expect(emojify('🇹🇷')).toEqual(
        '<img draggable="false" class="emojione" alt="🇹🇷" title=":flag-tr:" src="/packs/emoji/1f1f9-1f1f7.svg" />',
      );
      expect(emojify('🇹🇹')).toEqual(
        '<img draggable="false" class="emojione" alt="🇹🇹" title=":flag-tt:" src="/packs/emoji/1f1f9-1f1f9.svg" />',
      );
      expect(emojify('🇹🇻')).toEqual(
        '<img draggable="false" class="emojione" alt="🇹🇻" title=":flag-tv:" src="/packs/emoji/1f1f9-1f1fb.svg" />',
      );
      expect(emojify('🇹🇼')).toEqual(
        '<img draggable="false" class="emojione" alt="🇹🇼" title=":flag-tw:" src="/packs/emoji/1f1f9-1f1fc.svg" />',
      );
      expect(emojify('🇹🇿')).toEqual(
        '<img draggable="false" class="emojione" alt="🇹🇿" title=":flag-tz:" src="/packs/emoji/1f1f9-1f1ff.svg" />',
      );
      expect(emojify('🇺🇦')).toEqual(
        '<img draggable="false" class="emojione" alt="🇺🇦" title=":flag-ua:" src="/packs/emoji/1f1fa-1f1e6.svg" />',
      );
      expect(emojify('🇺🇬')).toEqual(
        '<img draggable="false" class="emojione" alt="🇺🇬" title=":flag-ug:" src="/packs/emoji/1f1fa-1f1ec.svg" />',
      );
      expect(emojify('🇺🇲')).toEqual(
        '<img draggable="false" class="emojione" alt="🇺🇲" title=":flag-um:" src="/packs/emoji/1f1fa-1f1f2.svg" />',
      );
      expect(emojify('🇺🇳')).toEqual(
        '<img draggable="false" class="emojione" alt="🇺🇳" title=":flag-un:" src="/packs/emoji/1f1fa-1f1f3.svg" />',
      );
      expect(emojify('🇺🇸')).toEqual(
        '<img draggable="false" class="emojione" alt="🇺🇸" title=":us:" src="/packs/emoji/1f1fa-1f1f8.svg" />',
      );
      expect(emojify('🇺🇾')).toEqual(
        '<img draggable="false" class="emojione" alt="🇺🇾" title=":flag-uy:" src="/packs/emoji/1f1fa-1f1fe.svg" />',
      );
      expect(emojify('🇺🇿')).toEqual(
        '<img draggable="false" class="emojione" alt="🇺🇿" title=":flag-uz:" src="/packs/emoji/1f1fa-1f1ff.svg" />',
      );
      expect(emojify('🇻🇦')).toEqual(
        '<img draggable="false" class="emojione" alt="🇻🇦" title=":flag-va:" src="/packs/emoji/1f1fb-1f1e6.svg" />',
      );
      expect(emojify('🇻🇨')).toEqual(
        '<img draggable="false" class="emojione" alt="🇻🇨" title=":flag-vc:" src="/packs/emoji/1f1fb-1f1e8.svg" />',
      );
      expect(emojify('🇻🇪')).toEqual(
        '<img draggable="false" class="emojione" alt="🇻🇪" title=":flag-ve:" src="/packs/emoji/1f1fb-1f1ea.svg" />',
      );
      expect(emojify('🇻🇬')).toEqual(
        '<img draggable="false" class="emojione" alt="🇻🇬" title=":flag-vg:" src="/packs/emoji/1f1fb-1f1ec.svg" />',
      );
      expect(emojify('🇻🇮')).toEqual(
        '<img draggable="false" class="emojione" alt="🇻🇮" title=":flag-vi:" src="/packs/emoji/1f1fb-1f1ee.svg" />',
      );
      expect(emojify('🇻🇳')).toEqual(
        '<img draggable="false" class="emojione" alt="🇻🇳" title=":flag-vn:" src="/packs/emoji/1f1fb-1f1f3.svg" />',
      );
      expect(emojify('🇻🇺')).toEqual(
        '<img draggable="false" class="emojione" alt="🇻🇺" title=":flag-vu:" src="/packs/emoji/1f1fb-1f1fa.svg" />',
      );
      expect(emojify('🇼🇫')).toEqual(
        '<img draggable="false" class="emojione" alt="🇼🇫" title=":flag-wf:" src="/packs/emoji/1f1fc-1f1eb.svg" />',
      );
      expect(emojify('🇼🇸')).toEqual(
        '<img draggable="false" class="emojione" alt="🇼🇸" title=":flag-ws:" src="/packs/emoji/1f1fc-1f1f8.svg" />',
      );
      expect(emojify('🇽🇰')).toEqual(
        '<img draggable="false" class="emojione" alt="🇽🇰" title=":flag-xk:" src="/packs/emoji/1f1fd-1f1f0.svg" />',
      );
      expect(emojify('🇾🇪')).toEqual(
        '<img draggable="false" class="emojione" alt="🇾🇪" title=":flag-ye:" src="/packs/emoji/1f1fe-1f1ea.svg" />',
      );
      expect(emojify('🇾🇹')).toEqual(
        '<img draggable="false" class="emojione" alt="🇾🇹" title=":flag-yt:" src="/packs/emoji/1f1fe-1f1f9.svg" />',
      );
      expect(emojify('🇿🇦')).toEqual(
        '<img draggable="false" class="emojione" alt="🇿🇦" title=":flag-za:" src="/packs/emoji/1f1ff-1f1e6.svg" />',
      );
      expect(emojify('🇿🇲')).toEqual(
        '<img draggable="false" class="emojione" alt="🇿🇲" title=":flag-zm:" src="/packs/emoji/1f1ff-1f1f2.svg" />',
      );
      expect(emojify('🇿🇼')).toEqual(
        '<img draggable="false" class="emojione" alt="🇿🇼" title=":flag-zw:" src="/packs/emoji/1f1ff-1f1fc.svg" />',
      );
      expect(emojify('🏴󠁧󠁢󠁥󠁮󠁧󠁿')).toEqual(
        '<img draggable="false" class="emojione" alt="🏴󠁧󠁢󠁥󠁮󠁧󠁿" title=":flag-england:" src="/packs/emoji/1f3f4-e0067-e0062-e0065-e006e-e0067-e007f.svg" />',
      );
      expect(emojify('🏴󠁧󠁢󠁳󠁣󠁴󠁿')).toEqual(
        '<img draggable="false" class="emojione" alt="🏴󠁧󠁢󠁳󠁣󠁴󠁿" title=":flag-scotland:" src="/packs/emoji/1f3f4-e0067-e0062-e0073-e0063-e0074-e007f.svg" />',
      );
      expect(emojify('🏴󠁧󠁢󠁷󠁬󠁳󠁿')).toEqual(
        '<img draggable="false" class="emojione" alt="🏴󠁧󠁢󠁷󠁬󠁳󠁿" title=":flag-wales:" src="/packs/emoji/1f3f4-e0067-e0062-e0077-e006c-e0073-e007f.svg" />',
      );
    });
  });
});
