import { Scratchpad } from '../src/utils/scratchpad';

describe('Scratchpad', () => {
  it('renders steps to messages', () => {
    const pad = new Scratchpad();
    pad.setTask('Do it');
    pad.addThought('think');
    pad.addAction({ type: 'action', mode: 'json', tool: 't', args: { a: 1 } });
    pad.addObservation('ok');
    pad.addReflexion('oops');
    const msgs = pad.toMessages('sys');
    expect(msgs[msgs.length - 1].content).toContain('Reflexion: oops');
  });
});
