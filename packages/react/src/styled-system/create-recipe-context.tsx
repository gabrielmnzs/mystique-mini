'use client';

import * as React from 'react';

import { MYSTIQUE_RESOLVED_STYLES_PROP, mystique } from './factory';
import type {
  JsxFactoryOptions,
  MystiqueComponent,
  RecipeSelection,
} from './factory.types';
import { useMystiqueContext } from './provider';
import type { RecipeName, RecipeTypegenProps } from './typegen';
import type { CvaFn, RecipeDefinition } from './types';

type AnyProps = Record<string, unknown>;

export type RecipeKey = RecipeName;

export interface RecipeContextOptions<
  K extends RecipeKey = RecipeKey,
  R extends RecipeDefinition | undefined = undefined,
> {
  key?: K;
  recipe?: R;
}

export type RecipeContextProps<
  K extends RecipeKey,
  R extends RecipeDefinition | undefined,
> = R extends RecipeDefinition ? RecipeSelection<R> : RecipeTypegenProps<K>;

function isCvaFn(value: unknown): value is CvaFn {
  return (
    typeof value === 'function' &&
    Array.isArray((value as CvaFn).variantKeys) &&
    typeof (value as CvaFn).splitVariantProps === 'function'
  );
}

function joinClassNames(...values: unknown[]): string | undefined {
  const result = values
    .filter(
      (value): value is string => typeof value === 'string' && value.length > 0,
    )
    .join(' ');
  return result || undefined;
}

function mergeContextProps(context: AnyProps, local: AnyProps): AnyProps {
  const result: AnyProps = {};
  for (const source of [context, local]) {
    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) continue;
      const previous = result[key];
      if (
        /^on[A-Z]/.test(key) &&
        typeof previous === 'function' &&
        typeof value === 'function'
      ) {
        result[key] = (...args: unknown[]) => {
          previous(...args);
          value(...args);
        };
      } else if (key === 'className') {
        result[key] = joinClassNames(previous, value);
      } else if (key === 'style') {
        result[key] = {
          ...(typeof previous === 'object' && previous !== null
            ? previous
            : {}),
          ...(typeof value === 'object' && value !== null ? value : {}),
        };
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

function upperFirst(value: string): string {
  return value ? `${value[0]?.toUpperCase()}${value.slice(1)}` : 'Component';
}

export function createRecipeContext<
  const K extends RecipeKey = RecipeKey,
  const R extends RecipeDefinition | undefined = undefined,
>(options: RecipeContextOptions<K, R>) {
  const contextName = upperFirst(
    options.key ?? options.recipe?.className ?? 'Component',
  );
  const PropsContext = React.createContext<AnyProps>({});
  PropsContext.displayName = `${contextName}PropsContext`;

  function usePropsContext(): AnyProps {
    return React.useContext(PropsContext);
  }

  function useRecipeResult(inputProps: AnyProps) {
    const system = useMystiqueContext();
    const { recipe: recipeOverride, unstyled, ...restProps } = inputProps;
    const recipe = React.useMemo(() => {
      if (isCvaFn(recipeOverride)) return recipeOverride;
      if (recipeOverride && typeof recipeOverride === 'object') {
        return system.cva(recipeOverride as RecipeDefinition);
      }
      if (options.recipe) return system.cva(options.recipe);
      if (options.key) return system.getRecipeFn(options.key) ?? system.cva({});
      return system.cva({});
    }, [recipeOverride, system]);
    const runtimeRecipe = recipe as unknown as CvaFn;
    const [variantProps, otherProps] = React.useMemo(
      () => runtimeRecipe.splitVariantProps(restProps),
      [runtimeRecipe, restProps],
    );
    const styles = unstyled ? {} : runtimeRecipe(variantProps);

    return {
      className: runtimeRecipe.className,
      props: otherProps as AnyProps,
      styles,
    };
  }

  const withContext = <
    T extends React.ElementType,
    P extends object = RecipeContextProps<K, R>,
  >(
    Component: T,
    factoryOptions?: JsxFactoryOptions<P>,
  ): MystiqueComponent<T, P> => {
    const SuperComponent = mystique(
      Component,
      {},
      factoryOptions as JsxFactoryOptions,
    ) as React.ElementType;
    const StyledComponent = React.forwardRef<React.ComponentRef<T>, P>(
      (inputProps, ref) => {
        const propsContext = usePropsContext();
        const props = React.useMemo(
          () => mergeContextProps(propsContext, inputProps as AnyProps),
          [inputProps, propsContext],
        );
        const result = useRecipeResult(props);
        const { className, css: cssProp, ...localProps } = result.props;

        return (
          <SuperComponent
            {...localProps}
            {...{ [MYSTIQUE_RESOLVED_STYLES_PROP]: result.styles }}
            ref={ref}
            css={cssProp}
            className={joinClassNames(result.className, className)}
          />
        );
      },
    );

    StyledComponent.displayName = factoryOptions?.displayName ?? contextName;
    return StyledComponent as unknown as MystiqueComponent<T, P>;
  };

  function withPropsProvider<P extends object>(): React.Provider<Partial<P>> {
    return PropsContext.Provider as unknown as React.Provider<Partial<P>>;
  }

  return {
    PropsProvider: PropsContext.Provider,
    usePropsContext,
    useRecipeResult,
    withContext,
    withPropsProvider,
  };
}
