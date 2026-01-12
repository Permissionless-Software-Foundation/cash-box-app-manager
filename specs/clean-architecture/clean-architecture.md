
# Clean Architecture

**Clean Architecture** is a software design pattern created by ['Uncle Bob'](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html). There are two main advantages to using this design pattern:

- It manages increasing complexity as new features and interfaces are added over time.
- It provides defense against [code rot](https://en.wikipedia.org/wiki/Software_rot) by isolating the parts that rarely change from the parts that change frequently.

I ran across [this great video](https://youtu.be/CnailTcJV_U) by Bill Sourour applying the Clean Architecture concepts to a REST API server built using node.js and the Express framework. The [example-ca-app directory](./example-ca-app) contains a simple REST API proxy app for Nostr. It implements the Clean Architecture patterns.

[In this video](https://youtu.be/LftjSIbHzbo), I expand on the Bill's original video and show how I applied Clean Architecture to my own REST API server using the Koa framework.

Code is split up into four groups:

- Entities
- Use Cases
- Adapters
- Controllers

Without knowing the patterns and reasoning behind Clean Architecture, the code will look 'weird' to most JavaScript developers. This is because Clean Architecture comes from outside the JavaScript world and some of it's core ideas (like dependency inversion) don't translate easily into JavaScript.

## File Layout

The code in the `src` folder of this repository is split up into four main directories: `entities`, `use-cases`, `adapaters`, and `controllers`. These directories reflect the arrangement of concerns in the Clean Architecture diagram:

![Clean Architecture Diagram](./img/cleanarchitecture.jpg)

The above diagram is reflected in the code. The Controllers and Adapters both make up the green circle. I distinguish between the two:

- Controllers are _inputs_ that cause the app to react.
- Adapters are _outputs_ that the app manipulates, like a database.

The diagram below shows how dependencies are arranged in the [P2WDB project](https://github.com/Permissionless-Software-Foundation/ipfs-p2wdb-service), another software project that follows Clean Architecture principles:

![Dependency Graph](./img/p2wdb-clean-architecture.png)

Major features of the diagram above:

- The blunt point of an arrow connects the file that depends on the file pointed to by the pointy end of the arrow.
- The dependencies in the above diagram follow the dependency arrows in the Clean Architecture diagram.
- This project is a Koa web server app (similar to Express.js). Koa is a framework and the entry point of Koa program loads the Controllers first.
- The Controllers load the Adapters, then it loads the Use Cases, then finally the Entities. Each lower stage depends on the stage above it.
- Dependency Injection is used heavily to pass dependencies to the individual libraries.
- Encapsulation pattern is used for unit tests.

As developers add new features to an app, the complexity increases as well. The Clean Architecture code pattern is efficient at managing complexity. Additionally, this code pattern is advantageous to achieving 100% unit test coverage.
