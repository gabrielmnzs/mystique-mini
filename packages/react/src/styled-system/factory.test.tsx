import {
  type ComponentProps,
  type ComponentType,
  createRef,
  forwardRef,
} from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { mystique } from './factory';
import { MystiqueProvider } from './provider';
import { createSystem } from './system';
import type { SystemStyleObject } from './types';

const testSystem = createSystem({
  preflight: false,
  utilities: {
    bg: { property: 'background' },
    backgroundColor: { property: 'backgroundColor' },
    color: { property: 'color' },
    display: { property: 'display' },
    padding: { property: 'padding' },
  },
});

function renderWithSystem(node: React.ReactNode) {
  return render(<MystiqueProvider value={testSystem}>{node}</MystiqueProvider>);
}

describe('mystique factory', () => {
  it('memoizes proxy targets and applies recipe < css < style-prop order', () => {
    expect(mystique.div).toBe(mystique.div);
    const Card = mystique('div', {
      base: { color: 'red' },
      className: 'mystique-card',
      defaultVariants: { tone: 'blue' },
      variants: {
        tone: {
          blue: { color: 'blue' },
        },
      },
    });

    renderWithSystem(
      <Card data-testid="card" css={{ color: 'green' }} color="purple" />,
    );

    const card = screen.getByTestId('card');
    expect(card.tagName).toBe('DIV');
    expect(card.className).toContain('mystique-card');
    expect(card.className).toMatch(/mystique-/);
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(card).toHaveStyleRule('color', 'purple');
    expect(card).not.toHaveAttribute('color');
    expect(card).not.toHaveAttribute('tone');
    expect(card).not.toHaveAttribute('css');
  });

  it('filters against the final `as` target and maps native aliases', () => {
    const Anchor = mystique.a;
    const Input = mystique.input;
    const Image = mystique.img;
    const RuntimeAnchor = Anchor as ComponentType<Record<string, unknown>>;
    const RuntimeForm = mystique.form as ComponentType<Record<string, unknown>>;
    const RuntimeInput = Input as ComponentType<Record<string, unknown>>;
    const RuntimeImage = Image as ComponentType<Record<string, unknown>>;
    const RuntimeIframe = mystique.iframe as ComponentType<
      Record<string, unknown>
    >;
    const RuntimeObject = mystique.object as ComponentType<
      Record<string, unknown>
    >;

    renderWithSystem(
      <>
        <RuntimeAnchor
          as="button"
          href="/not-forwarded"
          data-testid="button"
          type="button"
        />
        <Input data-testid="input" htmlSize="7" />
        <Image
          data-testid="image"
          alt="sample"
          htmlWidth={40}
          htmlHeight={30}
        />
        <Anchor data-testid="invalid-native" htmlSize="8" htmlWidth={40} />
        <RuntimeForm
          as="div"
          action="/not-forwarded"
          method="post"
          data-testid="form-as-div"
        />
        <RuntimeInput
          as="button"
          accept="image/*"
          checked
          defaultChecked
          formAction="/submit"
          data-testid="input-as-button"
          type="submit"
        />
        <RuntimeImage
          as="div"
          alt="not-forwarded"
          src="/image.png"
          data-testid="image-as-div"
        />
        <RuntimeAnchor
          data-testid="anchor-metadata"
          ping="/audit"
          type="text/html"
        />
        <details data-testid="details-metadata" name="accordion" />
        <RuntimeIframe
          as="div"
          data-testid="iframe-as-div"
          sandbox="allow-scripts"
        />
        <RuntimeObject
          as="div"
          data="/document.pdf"
          data-testid="object-as-div"
        />
      </>,
    );

    const button = screen.getByTestId('button');
    expect(button.tagName).toBe('BUTTON');
    expect(button).not.toHaveAttribute('href');
    expect(button).toHaveAttribute('type', 'button');
    expect(screen.getByTestId('input')).toHaveAttribute('size', '7');
    expect(screen.getByTestId('input')).not.toHaveAttribute('htmlSize');
    expect(screen.getByTestId('image')).toHaveAttribute('width', '40');
    expect(screen.getByTestId('image')).toHaveAttribute('height', '30');
    expect(screen.getByTestId('invalid-native')).not.toHaveAttribute('size');
    expect(screen.getByTestId('invalid-native')).not.toHaveAttribute('width');
    expect(screen.getByTestId('form-as-div')).not.toHaveAttribute('action');
    expect(screen.getByTestId('form-as-div')).not.toHaveAttribute('method');
    expect(screen.getByTestId('input-as-button')).not.toHaveAttribute('accept');
    expect(screen.getByTestId('input-as-button')).not.toHaveAttribute(
      'checked',
    );
    expect(screen.getByTestId('input-as-button')).not.toHaveAttribute(
      'defaultChecked',
    );
    expect(screen.getByTestId('input-as-button')).toHaveAttribute(
      'formaction',
      '/submit',
    );
    expect(screen.getByTestId('image-as-div')).not.toHaveAttribute('alt');
    expect(screen.getByTestId('image-as-div')).not.toHaveAttribute('src');
    expect(screen.getByTestId('anchor-metadata')).toHaveAttribute(
      'ping',
      '/audit',
    );
    expect(screen.getByTestId('anchor-metadata')).toHaveAttribute(
      'type',
      'text/html',
    );
    expect(screen.getByTestId('details-metadata')).toHaveAttribute(
      'name',
      'accordion',
    );
    expect(screen.getByTestId('iframe-as-div')).not.toHaveAttribute('sandbox');
    expect(screen.getByTestId('object-as-div')).not.toHaveAttribute('data');
  });

  it('filters parent and child props against the final asChild target', () => {
    const RuntimeForm = mystique.form as ComponentType<Record<string, unknown>>;

    renderWithSystem(
      <RuntimeForm asChild action="/parent" method="post">
        <div
          {...({ action: '/child', name: 'child-form' } as Record<
            string,
            unknown
          >)}
          data-testid="form-as-child"
        />
      </RuntimeForm>,
    );

    const child = screen.getByTestId('form-as-child');
    expect(child.tagName).toBe('DIV');
    expect(child).not.toHaveAttribute('action');
    expect(child).not.toHaveAttribute('method');
    expect(child).not.toHaveAttribute('name');
  });

  it('keeps React 19 element metadata target-aware, including native aliases', () => {
    const RuntimeArea = mystique.area as ComponentType<Record<string, unknown>>;
    const RuntimeDialog = mystique.dialog as ComponentType<
      Record<string, unknown>
    >;
    const RuntimeDiv = mystique.div as ComponentType<Record<string, unknown>>;
    const RuntimeLink = mystique.link as ComponentType<Record<string, unknown>>;
    const RuntimeMeter = mystique.meter as ComponentType<
      Record<string, unknown>
    >;
    const RuntimeObject = mystique.object as ComponentType<
      Record<string, unknown>
    >;
    const RuntimeSlot = mystique.slot as ComponentType<Record<string, unknown>>;
    const RuntimeTable = mystique.table as ComponentType<
      Record<string, unknown>
    >;
    const RuntimeTextarea = mystique.textarea as ComponentType<
      Record<string, unknown>
    >;

    renderWithSystem(
      <>
        <RuntimeLink
          blocking="render"
          data-testid="metadata-link"
          htmlAs="style"
          imageSizes="100vw"
          imageSrcSet="image-1x.png 1x"
          precedence="high"
        />
        <RuntimeDialog closedby="any" data-testid="metadata-dialog" />
        <RuntimeTextarea
          data-testid="metadata-textarea"
          dirName="direction"
          htmlWrap="soft"
        />
        <RuntimeMeter data-testid="metadata-meter" high={8} />
        <RuntimeSlot data-testid="metadata-slot" name="named-slot" />
        <RuntimeArea
          coords="0,0,10,10"
          data-testid="metadata-area"
          shape="rect"
        />
        <RuntimeObject
          classID="fixture"
          data-testid="metadata-object"
          wmode="opaque"
        />
        <RuntimeTable
          bgcolor="white"
          data-testid="metadata-table"
          htmlAlign="center"
          htmlBorder={1}
          htmlWidth={100}
          rules="rows"
          summary="fixture"
        />
        <RuntimeDiv
          classID="leak"
          closedby="any"
          coords="0,0,10,10"
          data-testid="metadata-div"
          high={8}
          mediaGroup="leak"
          shape="rect"
        />
      </>,
    );

    const link = screen.getByTestId('metadata-link');
    expect(link).toHaveAttribute('as', 'style');
    expect(link).toHaveAttribute('blocking', 'render');
    expect(link).toHaveAttribute('imagesizes', '100vw');
    expect(link).toHaveAttribute('imagesrcset', 'image-1x.png 1x');
    expect(link).toHaveAttribute('precedence', 'high');
    expect(screen.getByTestId('metadata-dialog')).toHaveAttribute(
      'closedby',
      'any',
    );
    expect(screen.getByTestId('metadata-textarea')).toHaveAttribute(
      'dirname',
      'direction',
    );
    expect(screen.getByTestId('metadata-textarea')).toHaveAttribute(
      'wrap',
      'soft',
    );
    expect(screen.getByTestId('metadata-meter')).toHaveAttribute('high', '8');
    expect(screen.getByTestId('metadata-slot')).toHaveAttribute(
      'name',
      'named-slot',
    );
    expect(screen.getByTestId('metadata-area')).toHaveAttribute(
      'coords',
      '0,0,10,10',
    );
    expect(screen.getByTestId('metadata-area')).toHaveAttribute(
      'shape',
      'rect',
    );
    expect(screen.getByTestId('metadata-object')).toHaveAttribute(
      'classid',
      'fixture',
    );
    expect(screen.getByTestId('metadata-object')).toHaveAttribute(
      'wmode',
      'opaque',
    );
    expect(screen.getByTestId('metadata-table')).toHaveAttribute(
      'align',
      'center',
    );
    expect(screen.getByTestId('metadata-table')).toHaveAttribute('border', '1');
    expect(screen.getByTestId('metadata-table')).toHaveAttribute(
      'width',
      '100',
    );

    const div = screen.getByTestId('metadata-div');
    for (const attribute of [
      'classid',
      'closedby',
      'coords',
      'high',
      'mediagroup',
      'shape',
    ]) {
      expect(div).not.toHaveAttribute(attribute);
    }
  });

  it('renders asChild without a DOM wrapper and composes props and refs', () => {
    const Div = mystique.div;
    const outerRef = createRef<HTMLAnchorElement>();
    const childRef = createRef<HTMLAnchorElement>();
    const outerClick = vi.fn();
    const childClick = vi.fn();

    renderWithSystem(
      <Div
        asChild
        className="outer"
        color="red"
        onClick={outerClick}
        ref={outerRef}
        style={{ color: 'blue', padding: 2 }}
      >
        <a
          className="inner"
          data-testid="child"
          href="/child"
          onClick={(event) => {
            event.preventDefault();
            childClick();
          }}
          ref={childRef}
          style={{ color: 'green' }}
        >
          child
        </a>
      </Div>,
    );

    const child = screen.getByTestId('child');
    expect(child.tagName).toBe('A');
    expect(child.parentElement?.querySelectorAll('a')).toHaveLength(1);
    expect(child.className).toContain('outer');
    expect(child.className).toContain('inner');
    expect(child.className).toMatch(/mystique-/);
    expect(child).toHaveStyle({ color: 'rgb(0, 128, 0)', padding: '2px' });
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(child).toHaveStyleRule('color', 'red');
    expect(child).not.toHaveAttribute('color');
    expect(outerRef.current).toBe(child);
    expect(childRef.current).toBe(child);

    fireEvent.click(child);
    expect(outerClick).toHaveBeenCalledOnce();
    expect(childClick).toHaveBeenCalledOnce();
    expect(outerClick.mock.invocationCallOrder[0]).toBeLessThan(
      childClick.mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY,
    );
  });

  it('keeps child-owned Mystique and custom-component props intact through asChild', () => {
    const Outer = mystique('div', testSystem.cva({}), {
      shouldForwardProp(prop) {
        return !['as', 'color', 'css'].includes(prop);
      },
    });
    const Inner = mystique.div;
    const DomainChild = forwardRef<
      HTMLSpanElement,
      { as: string; color: string; css: string; label: string }
    >(function DomainChild({ as, color, css, label, ...props }, ref) {
      return (
        <span
          {...props}
          data-as={as}
          data-color={color}
          data-css={css}
          ref={ref}
        >
          {label}
        </span>
      );
    });

    renderWithSystem(
      <>
        <Outer asChild color="red">
          <Inner
            as="section"
            bg="black"
            css={{ padding: 4 }}
            data-testid="nested-mystique"
          />
        </Outer>
        <Outer asChild>
          <DomainChild
            as="domain-target"
            color="domain-color"
            css="domain-css"
            data-testid="domain-child"
            label="domain"
          />
        </Outer>
      </>,
    );

    const nested = screen.getByTestId('nested-mystique');
    expect(nested.tagName).toBe('SECTION');
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(nested).toHaveStyleRule('color', 'red');
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(nested).toHaveStyleRule('background', 'black');
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(nested).toHaveStyleRule('padding', '4px');

    const domain = screen.getByTestId('domain-child');
    expect(domain).toHaveAttribute('data-as', 'domain-target');
    expect(domain).toHaveAttribute('data-color', 'domain-color');
    expect(domain).toHaveAttribute('data-css', 'domain-css');
  });

  it('does not transform recipe output a second time in the factory', () => {
    const transformingSystem = createSystem({
      disableLayers: true,
      preflight: false,
      utilities: {
        percentOpacity: {
          transform(value) {
            return { opacity: Number(value) / 100 };
          },
        },
      },
    });
    const Faded = mystique('div', {
      base: { percentOpacity: 50 } as SystemStyleObject,
    });

    render(
      <MystiqueProvider value={transformingSystem}>
        <Faded data-testid="faded" />
      </MystiqueProvider>,
    );

    // `opacity` is intentionally not itself registered as a utility here.
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(screen.getByTestId('faded')).toHaveStyleRule('opacity', '0.5');
  });

  it('flattens nested Mystique factories into one base-to-override recipe chain', () => {
    const composedSystem = createSystem({
      disableLayers: true,
      preflight: false,
      utilities: {
        backgroundColor: { property: 'backgroundColor' },
        color: { property: 'color' },
      },
    });
    const Base = mystique('div', {
      base: { color: 'red' },
      className: 'base-recipe',
      variants: {
        tone: { active: { backgroundColor: 'red' } },
      },
    });
    const Extended = mystique(Base, {
      base: { color: 'blue' },
      className: 'extended-recipe',
      variants: {
        tone: { active: { backgroundColor: 'blue' } },
      },
    });

    render(
      <MystiqueProvider value={composedSystem}>
        <Extended
          as="section"
          css={{ color: 'green' }}
          data-testid="composed"
          tone="active"
        />
        <Extended
          css={{ color: 'green' }}
          data-testid="composed-unstyled"
          tone="active"
          unstyled
        />
      </MystiqueProvider>,
    );

    const composed = screen.getByTestId('composed');
    expect(composed.tagName).toBe('SECTION');
    expect(composed.className).toContain('base-recipe');
    expect(composed.className).toContain('extended-recipe');
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(composed).toHaveStyleRule('background-color', 'blue');
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(composed).toHaveStyleRule('color', 'green');

    const unstyled = screen.getByTestId('composed-unstyled');
    expect(unstyled.className).not.toContain('base-recipe');
    expect(unstyled.className).not.toContain('extended-recipe');
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(unstyled).not.toHaveStyleRule('background-color');
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(unstyled).toHaveStyleRule('color', 'green');
  });

  it('honors React 19 callback-ref cleanup through asChild composition', () => {
    const Div = mystique.div;
    const outerCleanup = vi.fn();
    const childCleanup = vi.fn();
    const outerRef = vi.fn(() => outerCleanup);
    const childRef = vi.fn(() => childCleanup);

    const rendered = renderWithSystem(
      <Div asChild ref={outerRef}>
        <a href="/cleanup" ref={childRef}>
          cleanup
        </a>
      </Div>,
    );

    expect(outerRef).toHaveBeenCalledOnce();
    expect(childRef).toHaveBeenCalledOnce();
    rendered.unmount();
    expect(outerCleanup).toHaveBeenCalledOnce();
    expect(childCleanup).toHaveBeenCalledOnce();
  });

  it('rejects invalid asChild targets instead of creating wrappers', () => {
    const Div = mystique.div;

    // @ts-expect-error the public types reject null; keep the runtime guard covered
    expect(() => renderWithSystem(<Div asChild>{null}</Div>)).toThrow(
      /exactly one valid React element/,
    );
    expect(() =>
      renderWithSystem(
        <Div asChild>
          <>
            <span>fragment</span>
          </>
        </Div>,
      ),
    ).toThrow(/cannot target a React.Fragment/);
  });

  it('preserves custom target requirements and rejects unknown intrinsic props', () => {
    const Div = mystique.div;
    const Custom = forwardRef<HTMLSpanElement, { required: string }>(
      function CustomTarget({ required }, ref) {
        return <span ref={ref}>{required}</span>;
      },
    );
    const StyledCustom = mystique(Custom);

    const validDefault: ComponentProps<typeof StyledCustom> = {
      required: 'yes',
    };
    const validOverride = <Div as={Custom} required="yes" />;
    const validAnchor = <Div as="a" href="/typed" />;

    // @ts-expect-error custom default props remain required
    const invalidCustom: ComponentProps<typeof StyledCustom> = {};
    // @ts-expect-error href is not valid on the default div target
    const invalidHref = <Div href="/invalid" />;
    // @ts-expect-error unknown props are rejected
    const invalidUnknown = <Div totallyUnknown />;

    type IsAny<T> = 0 extends 1 & T ? true : false;
    type AssertFalse<T extends false> = T;
    type PropsAreNotAny = AssertFalse<IsAny<ComponentProps<typeof Div>>>;

    expect([
      validDefault,
      validOverride,
      validAnchor,
      invalidCustom,
      invalidHref,
      invalidUnknown,
      StyledCustom,
    ]).toHaveLength(7);
    expect(null as unknown as PropsAreNotAny).toBeNull();
  });
});
