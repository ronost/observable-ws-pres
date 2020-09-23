import { Component } from '@angular/core';
import { Observable, of, interval, timer, Subject, from } from 'rxjs';
import { take, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'observables-ws';
  code_ex = `
  import { Component } from '@angular/core';

    @Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.scss']
    })
    export class AppComponent {
      title = 'observables-ws';
    }
  `;
  obs4NrOfClicks: number = 0;
  constructor() {}

  coldObs = `
  var cold = new Observable((observer) => {
    var producer = new Producer();
      // have observer listen to producer here
      observer.next(producer.getSomeValue());
    }
  );`;

  hotObs = `
  var producer = new Producer();
  var hot = new Observable((observer) => {
    // have observer listen to producer here
    observer.next(producer.getSomeValue());
  });`;















  observerObject = () => {
    /***
     * Case 1
     * Declares Observer object and creates subscription on Observable using Observer
     */
    let observer = {
      next: value => console.log('next: ', value),
      error: error => console.error('error: ', error),
      complete: () => console.log('done')
    };
    let observable1 = new Observable(subscriber => {
      subscriber.next('1st value');
      subscriber.next('2nd value');
      subscriber.error('Error message');
      subscriber.next('3rd value');
      subscriber.complete();
      subscriber.next('4th value');
    });
    
    observable1.subscribe(value => console.log('next: ', value));
  }
























  observerAsync = () => {
    /***
     * Case 2
     * Declares Observer object and creates subscription on Observable using Observer
     * Values are emitted asynchronously.
     * 
     * Also showcases complete()/error()'s unsubscription and manually unsubscribing.
     */
    let observer = {
      next: value => console.log("next: ", value),
      error: error => console.error("error: ", error),
      complete: () => console.log("done")
    }
    let observable1 = new Observable(subscriber => {
      subscriber.next('1st value');
      setTimeout(() => {
        subscriber.next('2nd value');
      }, 1000);
      setTimeout(() => {
        subscriber.next('3rd value');
      }, 2000);
      setTimeout(() => {
        // Uncomment to showcase error instead of complete.
        //subscriber.error()
        subscriber.complete();
      }, 3000);
    });

    let subscription = observable1.subscribe(observer);

    // Uncomment to unsubscribe manually
    subscription.unsubscribe();

    // From RxJS doc: public closed: boolean - A flag to indicate whether this Subscription has already been unsubscribed.
    console.log("before complete/error - subscription->closed: ", !!subscription.closed);
    setTimeout(() => {
      console.log("after complete/error - subscription->closed: ", !!subscription.closed);
    }, 4000);
  }


























  observableOfOf = () => {
    /**
     * Case 3 - using of to create observable with an Observer object.
     */
    let observer = {
      next: value => console.log("next: ", value),
      error: error => console.error("error: ", error),
      complete: () => console.log("done")
    }
    of('1st value', '2nd value', '3rd value').subscribe(observer);
  }






























  multipleColdObservables = () => {
    /**
     * Case 4 - multiple subscriptions with multiple clicks. Unsubscribes after 10s.
     * No observer object, showcases that functions can be passed as next, error, complete directly to subscribe().
     * Showcases that cold Observables are unicast in that each subscription is independent.
     */
    let obsId: number = ++this.obs4NrOfClicks;
    let obsName = String.fromCharCode(64 + obsId);

    let coldObservable = new Observable(subscriber => {
      let coldObsIdx = 0;
      subscriber.next(coldObsIdx++);
      setInterval(() => {
        subscriber.next(coldObsIdx++);
      }, 1000);
    });

    let subscription = coldObservable.subscribe(value => console.log(`observerId: ${ obsName } index: ${ value }`));

    setTimeout(() => {
      console.log('--> cancel subscription: ', obsName);
      subscription.unsubscribe();
    }, 10000);
  }





























  hotObsIdx = 0;
  multipleHotObservables = () => {
    /**
     * Case 5 - multiple subscriptions with multiple clicks. Unsubscribes after 10s.
     * No observer object, showcases that functions can be passed as next, error, complete directly to subscribe().
     * Showcases that hot Observables are multicast in that each subscription is connected to the same source.
     */
    let obsId: number = ++this.obs4NrOfClicks;
    let obsName = String.fromCharCode(64 + obsId);
    if (this.hotObsIdx == 0) {
      setInterval(() => {
        this.hotObsIdx++;
      }, 1000);
    }

    let coldObservable = new Observable(subscriber => {
      subscriber.next(this.hotObsIdx);
      setInterval(() => {
        subscriber.next(this.hotObsIdx);
      }, 1000);
    });



    let subscription = coldObservable.subscribe(value => console.log(`observerId: ${ obsName } index: ${ value }`));

    setTimeout(() => {
      console.log('--> cancel subscription: ', obsName);
      subscription.unsubscribe();
    }, 10000);
  }


























  multipleSubjects = () => {
    /**
     * Case 6 - multiple subscriptions on Subject.
     * Showcases that Subjects are multicast in that subscriptions share source.
     * Also showcases unsibscribing to multiple subscriptions. 
     */
    const subject = new Subject<number>();

    let subscriptionA = subject.subscribe({
      next: (v) => console.log(`observerA: ${ v }`)
    });
    let subscriptionB = subject.subscribe({
      next: (v) => console.log(`observerB: ${ v }`)
    });

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    let subscriptionC = subject.subscribe({
      next: (v) => console.log(`observerC: ${ v }`)
    });
    subscriptionA.add(subscriptionB);
    subscriptionA.add(subscriptionC);

    subject.next(5);
    subject.next(6);

    subscriptionB.unsubscribe();

    subject.next(7);
    subject.next(8);
    subject.next(9);
    subject.next(10);

    console.log("before unsubscribe - subscriptionA->closed: ", !!subscriptionA.closed); // should be false
    console.log("before unsubscribe - subscriptionB->closed: ", !!subscriptionB.closed); // should be true - since closed a little bit earlier
    console.log("before unsubscribe - subscriptionC->closed: ", !!subscriptionC.closed); // should be false

    subscriptionA.unsubscribe();

    console.log("after unsubscribe - subscriptionA->closed: ", !!subscriptionA.closed); // should be true
    console.log("after unsubscribe - subscriptionB->closed: ", !!subscriptionB.closed); // should be true
    console.log("after unsubscribe - subscriptionC->closed: ", !!subscriptionC.closed); // should be true - although not explicitly unsubsribed, but closed since added to subscriptionA.
  }
}
