import '../style.css';
import './components/follow.component/follow.component.scss';
import FollowComponent from './components/follow.component/follow.component';

const followComponent = new FollowComponent();
followComponent.init(
  document.querySelector('.widget-item__remove-btn'),
  document.querySelector('.github-widget__refresh'),
);
