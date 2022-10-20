import {Injectable} from "./decorators"
import {Inject} from "./dependency-helpers"

@Injectable({
    namespace: 'Core/Handler'
})
class InjectableTest {
    private readonly second: Second

    constructor() {
        this.second = Inject({
            namespace: 'Other/Module'
        }) as Second
    }

    hello() {
        return this.second.world()
    }
}

@Injectable({
    namespace: 'Other/Module'
})
class Second {
    world() {
        return 'second'
    }
}

const testInstance = Inject({namespace: 'Core/Handler'}) as InjectableTest

console.log(testInstance.hello())