import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { fetchAboutPage } from 'pl-fe/actions/about';
import { Navlinks } from 'pl-fe/components/navlinks';
import { Card } from 'pl-fe/components/ui';
import { usePlFeConfig, useSettings, useAppDispatch } from 'pl-fe/hooks';

import { languages } from '../preferences';

/** Displays arbitrary user-uploaded HTML on a page at `/about/:slug` */
const AboutPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { slug } = useParams<{ slug?: string }>();

  const settings = useSettings();
  const plFeConfig = usePlFeConfig();

  const [pageHtml, setPageHtml] = useState<string>('');
  const [locale, setLocale] = useState<string>(settings.locale);

  const { aboutPages } = plFeConfig;

  const page = aboutPages.get(slug || 'about');
  const defaultLocale = page?.get('default') as string | undefined;
  const pageLocales = page?.get('locales', []) as string[];

  useEffect(() => {
    const fetchLocale = Boolean(page && locale !== defaultLocale && pageLocales.includes(locale));
    dispatch(fetchAboutPage(slug, fetchLocale ? locale : undefined)).then(html => {
      setPageHtml(html);
    }).catch(error => {
      // TODO: Better error handling. 404 page?
      setPageHtml('<h1>Page not found</h1>');
    });
  }, [locale, slug]);

  const alsoAvailable = (defaultLocale) && (
    <div>
      <FormattedMessage id='about.also_available' defaultMessage='Available in:' />
      {' '}
      <ul className='inline list-none p-0'>
        <li className="inline after:content-['_·_']">
          <a href='#' onClick={() => setLocale(defaultLocale)}>
            {/* @ts-ignore */}
            {languages[defaultLocale] || defaultLocale}
          </a>
        </li>
        {
          pageLocales?.map(locale => (
            <li className="inline after:content-['_·_'] last:after:content-none" key={locale}>
              <a href='#' onClick={() => setLocale(locale)}>
                {/* @ts-ignore */}
                {languages[locale] || locale}
              </a>
            </li>
          ))
        }
      </ul>
    </div>
  );

  return (
    <div>
      <Card variant='rounded'>
        <div className='prose dark:prose-invert mx-auto py-4 sm:p-6'>
          <div dangerouslySetInnerHTML={{ __html: pageHtml }} />
          {alsoAvailable}
        </div>
      </Card>

      <Navlinks type='homeFooter' />
    </div>
  );
};

export { AboutPage as default };
