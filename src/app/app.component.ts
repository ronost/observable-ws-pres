import { Component } from '@angular/core';
import { Observable, of, interval, timer, Subject } from 'rxjs';
import { timeout } from 'rxjs/operators';

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
    }
  );`;

  hotObs = `
  var producer = new Producer();
  var hot = new Observable((observer) => {
    // have observer listen to producer here
  });`;

  observerObject = () => {
    /***
     * Case 1
     * Declares Observer object and creates subscription on Observable using Observer
     */
    let observer = {
      next: value => console.log('next: ', value),
      error: error => console.error('error: ', error),
      complete: () => console.log('complete')
    };

    let observable1 = new Observable(obs => {
      obs.next('first value');
      obs.next('second value');
      obs.error('Error message');
      obs.next('third value');
      obs.complete();
      obs.next('forth value');
    });
    
    observable1.subscribe(observer);
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
      complete: () => console.log("complete")
    }
    let observable1 = new Observable(obs => {
      obs.next('first value');
      setTimeout(() => {
        obs.next('second value');
      }, 1000);
      setTimeout(() => {
        obs.next('third value');
      }, 2000);
      setTimeout(() => {
        // Uncomment to showcase error instead of complete.
        //obs.error()
        obs.complete();
      }, 3000);
    });
    
    let subscription = observable1.subscribe(observer);

    // Uncomment to unsubscribe manually
    //subscription.unsubscribe();

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
      complete: () => console.log("complete")
    }
    of('first value', 'second value', 'third value').subscribe(observer);
  }

  multipleObservables = () => {
    /**
     * Case 4 - multiple subscriptions with multiple clicks. Unsubscribes after 10s.
     * No observer object, showcases that functions can be passed as next, error, complete directly to subscribe().
     * Showcases that Observables are unicast in that each subscription is independent.
     */
    let obsId: number = ++this.obs4NrOfClicks;
    let subscriptions: any = timer(0, 1000).subscribe(value => console.log(`obs ${ obsId } next: ${ value }`));

    setTimeout(() => {
      console.log('cancel subscription: ', obsId);
      subscriptions.unsubscribe();
    }, 10000);
  }

  multipleSubjects = () => {
    /**
     * Case 5 - multiple subscriptions on Subject.
     * Showcases that Subjects are multicast in that subscriptions share source.
     * Also showcases unsibscribing to multiple subscriptions. 
     */
    const subject = new Subject<number>();

    let subscriptionA = subject.subscribe({
      next: (v) => console.log(`observerA: ${v}`)
    });
    let subscriptionB = subject.subscribe({
      next: (v) => console.log(`observerB: ${v}`)
    });

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    let subscriptionC = subject.subscribe({
      next: (v) => console.log(`observerC: ${v}`)
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
