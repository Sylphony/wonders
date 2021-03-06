import { Writable } from 'stream';
import Wonders from '../';
import { renderTree } from '../lib/render';

jest.mock('minimist');

describe('render', () => {
    const argv = ['/usr/local/bin/node', __filename];
    const minimist = require('minimist');
    const echo = (args, options) => new Promise((resolve) => {
        setTimeout(() => resolve(`Echo: ${options.name}`), 100);
    });
    const deploy = () => new Promise((resolve) => {
        setTimeout(() => resolve('Deployed!'), 100);
    });
    const Program = () => (
        <program version="1.0.0" parse={argv}>
            <command name="echo" onAction={echo} />
            <command name="deploy" onAction={deploy} />
            <command name="beep">Beep!</command>
            <command name="boop">Boop!</command>
            <command name="num">{1}</command>
            <command name="bool">{true}</command>
        </program>
    );

    it('should run the beep command.', async () => {
        minimist.__setReturnValue({
            _: [
                'beep',
            ],
        });

        const s = new Writable();
        s.write = jest.fn();


        await Wonders.render(<Program />, s);
        expect(s.write).toHaveBeenCalledWith('Beep!');
    });

    it('should run the boop command.', async () => {
        minimist.__setReturnValue({
            _: [
                'boop',
            ],
        });

        const s = new Writable();
        s.write = jest.fn();

        await Wonders.render(<Program />, s);
        expect(s.write).toHaveBeenCalledWith('Boop!');
    });

    it('should run the num command.', async () => {
        minimist.__setReturnValue({
            _: [
                'num',
            ],
        });

        const s = new Writable();
        s.write = jest.fn();

        await Wonders.render(<Program />, s);
        expect(s.write).toHaveBeenCalledWith('1');
    });

    it('should run the bool command.', async () => {
        minimist.__setReturnValue({
            _: [
                'bool',
            ],
        });

        const s = new Writable();
        s.write = jest.fn();

        await Wonders.render(<Program />, s);
        expect(s.write).toHaveBeenCalledWith('true');
    });

    it('should run the deploy command.', async () => {
        minimist.__setReturnValue({
            _: [
                'deploy',
            ],
        });

        const s = new Writable();
        s.write = jest.fn();

        await Wonders.render(<Program />, s);
        expect(s.write).toHaveBeenCalledWith('Deployed!');
    });

    it('should echo "foo".', async () => {
        minimist.__setReturnValue({
            _: [
                'echo',
            ],
            name: 'foo',
        });

        const s = new Writable();
        s.write = jest.fn();

        await Wonders.render(<Program />, s);
        expect(s.write).toHaveBeenCalledWith('Echo: foo');
    });

    it('should echo "hello world".', async () => {
        minimist.__setReturnValue({
            _: [
                'echo',
            ],
            name: 'hello world',
        });

        const s = new Writable();
        s.write = jest.fn();

        await Wonders.render(<Program />, s);
        expect(s.write).toHaveBeenCalledWith('Echo: hello world');
    });

    it('should render foobar in bold and italics.', () => {
        const node = <strong><em>foobar</em></strong>;
        expect(renderTree(node))
            .toEqual('\u001b[1m\u001b[3mfoobar\u001b[0m\u001b[0m');
    });

    it('should render foobar in a paragraph.', () => {
        const node = <p><em>foobar</em></p>;
        expect(renderTree(node))
            .toEqual('\n\u001b[3mfoobar\u001b[0m\n');
    });

    it('should render a custom component.', () => {
        class Foobar extends Wonders.Component {
            render() {
                return 'Hello, world';
            }
        }
        expect(renderTree(<Foobar />))
            .toEqual('Hello, world');
    });

    it('should render a deeply nested custom component.', () => {
        class ExampleList extends Wonders.Component {
            render() {
                return (
                    <ul>
                        <BoldListItem>foo</BoldListItem>
                        <BoldListItem>bar</BoldListItem>
                    </ul>
                )
            }
        }

        class BoldListItem extends Wonders.Component {
            render() {
                return (
                    <li>
                        <strong>{this.props.children}</strong>
                    </li>
                );
            }
        }

        expect(renderTree(<ExampleList />))
            .toEqual('\n\t\u2022\u001b[1mfoo\u001b[0m\n\t\u2022\u001b[1mbar\u001b[0m\n');

    });
});
