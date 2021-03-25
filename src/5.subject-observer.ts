// 发布订阅, 发布和订阅之间没有任何关联, 中间有第三方arr
// 观察者, 观察者和被观察者之间是存在关联的(内部还是发布订阅), 将所有的观察者放到被观察者之中

class Subject {
  // 被观察者
  public name: string;
  public state: string;
  public observers: Observer[];
  constructor(name) {
    this.name = name;
    this.state = '123';
    this.observers = [];
  }
  attach(o: Observer) {
    this.observers.push(o);
  }
  setState(newState: string) {
    this.state = newState;
    this.observers.forEach((o) => o.update(this));
  }
}

class Observer {
  // 观察者
  public name: string;
  constructor(name) {
    this.name = name;
  }
  update(data: Subject) {
    console.log(this.name + ' &&& ' + data.name + data.state);
  }
}

let subject = new Subject('subject');
let observer1 = new Observer('1');
let observer2 = new Observer('2');
let observer3 = new Observer('3');

subject.attach(observer1);
subject.attach(observer2);
subject.attach(observer3);

subject.setState('subject-new');

export {};
