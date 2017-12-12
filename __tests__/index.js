import Enzyme from 'enzyme';
import PreactAdapter from 'preact-enzyme-adapter';

Enzyme.configure({ adapter: new PreactAdapter });
