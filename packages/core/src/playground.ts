import Reagent from "./index";
import {Injectable} from "./decorators";
import {Inject} from "./dependency-helpers";

@Injectable({
    namespace: 'Test'
})
class Test {
    hello() {
        console.log('world')
    }
}

const app = Reagent({
    modules: [
        {
            identifier: 'module-one',
            injectables: [
                Test
            ]
        }
    ]
})

const test = Inject({ namespace: 'Test' }) as Test

test.hello()