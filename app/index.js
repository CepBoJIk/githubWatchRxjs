import '../style.css';
import './components/follow.component/follow.component.scss';
import FollowComponent from './components/follow.component/follow.component';

const followComponent = new FollowComponent(
  document.querySelector('.widget-template'),
  document.querySelector('.github-widget__content'),
);
followComponent.init(
  'widget-item__remove-btn',
  document.querySelector('.github-widget__refresh'),
);
