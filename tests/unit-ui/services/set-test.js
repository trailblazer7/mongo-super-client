'use strict';

describe('mongoQueryAdapter', () => {
  describe('setQueryParams', () => {
    describe('when no params passed', () => {
      let mongoQueryAdapter;
      let params = null;

      beforeEach(() => {
        angular.mock.module('app');

        inject([
          'mongoQueryAdapter', (_mongoQueryAdapter) => {
            mongoQueryAdapter = _mongoQueryAdapter;
          }
        ]);
      });

      it('should be rejected', () => {
        mongoQueryAdapter
        .setQueryParams(params)
        .then(
            (result) => {
                expect(result).not.toBeDefined();
            },
            (error) => {
                expect(error.message).toBeDefined();
            }
        );
      });
    });
  });
});

describe('expressionHandler', () => {
    describe('setExpression', () => {
        let expressionHandler;
        let expression = null;

        beforeEach(() => {
            angular.mock.module('app');

            inject([
            'expressionHandler', (_expressionHandler) => {
                expressionHandler =  new _expressionHandler();
            }
            ]);
        });

        it('should be rejected', () => {
            expressionHandler
            .setExpression(expression)
            .then(
                (result) => {
                    expect(result).not.toBeDefined();
                },
                (error) => {
                    expect(error.message).toBeDefined();
                }
            );
        });
    });
});