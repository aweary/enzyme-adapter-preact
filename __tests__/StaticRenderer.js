import { h, Component } from 'preact';
import PropTypes from 'proptypes';
import { expect } from 'chai';
import { render } from 'enzyme';

describe('render', () => {
  describe('context', () => {
    it('can pass in context', () => {
      class SimpleComponent extends Component {
        render() {
          return <div>{this.context.name}</div>;
        }
      };

      SimpleComponent.contextTypes = {
        name: PropTypes.string
      };

      const context = { name: 'foo' };
      const wrapper = render(<SimpleComponent />, { context });
      expect(wrapper).to.have.lengthOf(1);

      expect(wrapper.is('div')).to.equal(true);
      expect(wrapper.text()).to.equal('foo');

      expect(String(wrapper)).to.equal('<div>foo</div>');
    });

    it('can pass context to the child of mounted component', () => {
      class SimpleComponent extends Component {
        render() {
          return <span>{this.context.name}</span>;
        }
      };

      SimpleComponent.contextTypes = {
        name: PropTypes.string,
      };

      class ComplexComponent extends Component {
        render() {
          return <div><SimpleComponent /></div>;
        }
      };

      const childContextTypes = {
        name: PropTypes.string.isRequired,
      };
      const context = { name: 'foo' };
      const wrapper = render(<ComplexComponent />, { context, childContextTypes });
      expect(wrapper).to.have.length(1);

      expect(wrapper.is('div')).to.equal(true);

      const children = wrapper.children();
      expect(children).to.have.length(1);
      expect(children.is('span')).to.equal(true);

      expect(children.first().text()).to.equal('foo');

      expect(String(wrapper)).to.equal('<div><span>foo</span></div>');
      expect(String(children)).to.equal('<span>foo</span>');
    });

    it('should not throw if context is passed in but contextTypes is missing', () => {
      class SimpleComponent extends Component {
        render() {
          return <div>{this.context.name}</div>;
        }
      };

      const context = { name: 'foo' };
      expect(() => render(<SimpleComponent />, { context })).to.not.throw(Error);
    });
  });
});
