import { describe, it, expect } from 'vitest'
import {buildLoadOrder, ModuleList} from "../src";


const mockModuleList1: ModuleList = [
    {
        identifier: 'module-three',
        dependsOn: [
            'module-one',
            'module-two'
        ]
    },
    {
        identifier: 'module-one',
    },
    {
        identifier: 'module-two',
        dependsOn: [
            'module-one',
            'module-four'
        ]
    },
    {
        identifier: 'module-four'
    }
]

const mockModuleList2: ModuleList = [
    {
        identifier: 'module-three',
        dependsOn: [
            'module-one',
            'module-two'
        ]
    },
    {
        identifier: 'module-one',
    },
    {
        identifier: 'module-two',
        dependsOn: [
            'module-one',
            'module-four'
        ]
    },
    {
        identifier: 'module-four'
    },
    {
        identifier: 'module-five'
    },
    {
        identifier: 'module-six'
    }
]

const mockModuleList3: ModuleList = [
    {
        identifier: 'module-three',
        dependsOn: [
            'module-one',
            'module-two'
        ]
    },
    {
        identifier: 'module-one',
    },
    {
        identifier: 'module-two',
        dependsOn: [
            'module-one',
            'module-four'
        ]
    },
    {
        identifier: 'module-four'
    },
    {
        identifier: 'module-five'
    },
    {
        identifier: 'module-six'
    },
    {
        identifier: 'module-seven',
        dependsOn: [
            'module-two',
            'module-three',
            'module-five',
            'module-six'
        ]
    }
]

const mockModuleList4: ModuleList = [
    {
        identifier: 'module-one',
    }
]

describe('LoadOrderBuilder', () => {
    it.each([
        [mockModuleList1, [
            'module-one',
            'module-four',
            'module-two',
            'module-three'
        ]],
        [mockModuleList2, [
            'module-one',
            'module-four',
            'module-five',
            'module-six',
            'module-two',
            'module-three'
        ]],
        [mockModuleList3, [
            'module-one',
            'module-four',
            'module-five',
            'module-six',
            'module-two',
            'module-three',
            'module-seven'
        ]],
        [
            mockModuleList4, [
                'module-one'
            ]
        ]
    ])('should build load order successfully', (modules, expected) => {
        const loadOrder = buildLoadOrder(modules);

        expect(loadOrder)
        .toStrictEqual(expected)
    })
})