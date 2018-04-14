import Enzyme from 'enzyme';
import { Adapter } from 'preact-enzyme-adapter';

Enzyme.configure({ adapter: new Adapter });
