
export const CREATE_NEW_REQUEST = `
INSERT INTO request_sell (status, phone)
  VALUES ('pending', $1);
`;

export const UPDATE_EXISTING_REQUESTS = `
UPDATE request_sell
  SET update_date = CAST(NOW() AS TIMESTAMP WITHOUT TIME ZONE)
  WHERE status = 'pending' AND phone = $1;
`;

export const GET_INDICATIVE_PRICES_BY_USD = `select i.company_, lc.location_name, i.location_, cn.name_ua, el.short_name as ename, price_usd, source, i.add_date, i.collect_date, ( select price_usd from indicative where collect_date > now() - '3 day' :: interval and price_usd != i.price_usd and commodity = i.commodity and company_ = i.company_ and location_ = i.location_ and ( ( elevator_ = i.elevator_ and elevator_ is not null ) or ( elevator_ is null and i.elevator_ is null ) ) order by collect_date desc limit 1 ) as price_to_diff from indicative as i inner join location as lc on lc.location_ = i.location_ left join elevator as el on el.id = i.elevator_ inner join company as cn on ( cn.company_ = i.company_ and cn.collect_date > now() - '7 day' :: interval and cn.enabled = true ) where price_usd is not null and i.collect_date = cn.collect_date and lc.locations_status = 1 and commodity = $1 and add_date > now() - '7 day' :: interval order by lc.order_position asc nulls last, i.price_usd desc, cn.name_ua`;
export const GET_INDICATIVE_PRICES_BY_UAH = `select i.company_, lc.location_name, i.location_, cn.name_ua, el.short_name as ename, source, price_uah, i.add_date, i.collect_date, ( select price_uah from indicative where collect_date > now() - '3 day' :: interval and price_uah != i.price_uah and commodity = i.commodity and company_ = i.company_ and location_ = i.location_ and ( ( elevator_ = i.elevator_ and elevator_ is not null ) or ( elevator_ is null and i.elevator_ is null ) ) order by collect_date desc limit 1 ) as price_to_diff from indicative as i inner join location as lc on lc.location_ = i.location_ left join elevator as el on el.id = i.elevator_ inner join company as cn on ( cn.company_ = i.company_ and cn.collect_date > now() - '7 day' :: interval and cn.enabled = true ) where price_uah is not null and i.collect_date = cn.collect_date and lc.locations_status = 1 and commodity = $1 and add_date > now() - '7 day' :: interval order by lc.order_position asc nulls last, i.price_uah desc, cn.name_ua`;
export const GET_INDICATIVE_PRICES_BY_LOCATION = `select i.company_, lc.location_name, i.location_, cn.name_ua, el.short_name as ename, source, price_uah, i.add_date, i.collect_date, ( select price_uah from indicative where collect_date > now() - '3 day' :: interval and price_uah != i.price_uah and commodity = i.commodity and company_ = i.company_ and location_ = i.location_ and ( ( elevator_ = i.elevator_ and elevator_ is not null ) or ( elevator_ is null and i.elevator_ is null ) ) order by collect_date desc limit 1 ) as price_to_diff from indicative as i inner join location as lc on lc.location_ = i.location_ left join elevator as el on el.id = i.elevator_ inner join company as cn on ( cn.company_ = i.company_ and cn.collect_date > now() - '7 day' :: interval and cn.enabled = true ) where price_uah is not null and i.collect_date = cn.collect_date and lc.locations_status = 0 and i.commodity = $1 and lc.location_ = $2 and add_date > now() - '7 day' :: interval order by lc.order_position asc nulls last, i.price_uah desc, cn.name_ua`;
export const GET_INDICATIVE_PRICES_BY_COMPANY = `select 
  i.company_, 
  lc.location_name, 
  i.location_, 
  cn.name_ua, 
  el.short_name as ename, 
  source, 
  price_uah, 
  i.add_date, 
  i.collect_date, 
  (
    select 
      price_uah 
    from 
      indicative 
    where 
      collect_date > now() - '3 day' :: interval 
      and price_uah != i.price_uah 
      and commodity = i.commodity 
      and company_ = i.company_ 
      and location_ = i.location_ 
      and (
        (
          elevator_ = i.elevator_ 
          and elevator_ is not null
        ) 
        or (
          elevator_ is null 
          and i.elevator_ is null
        )
      ) 
    order by 
      collect_date desc 
    limit 
      1
  ) as price_to_diff 
from 
  indicative as i 
  inner join location as lc on lc.location_ = i.location_ 
  left join elevator as el on el.id = i.elevator_ 
  inner join company as cn on (
    cn.company_ = i.company_ 
    and cn.collect_date > now() - '7 day' :: interval 
    and cn.enabled = true
  ) 
where 
  price_uah is not null 
  and i.collect_date = cn.collect_date 
  and i.company_ = $1
  and add_date > now() - '7 day' :: interval 
order by 
  lc.order_position asc nulls last, 
  i.price_uah desc, 
  cn.name_ua
`

export const GET_TRADER_QUERY = `select * from trader as tr inner join telegram_subscribe as ts on (ts.mobile_phone = tr.phone) where ts.telegram_id = ($1)`;
export const GET_TRADERS_QUERY: string = `select * from trader as tr inner join telegram_subscribe as ts on (ts.mobile_phone = tr.phone) where ts.telegram_id = ANY($1)`;

export const USER_INFO_QUERY = `
  SELECT
    analytic_user.phone AS phone,
    (
      CASE telegram_subscribe.telegram_id
      WHEN NULL THEN NULL
      ELSE telegram_subscribe.first_name || ' ' || telegram_subscribe.last_name
      END
    ) AS telegram_name,
    telegram_subscribe.role AS telegram_role,
    telegram_subscribe.add_date AS telegram_date,
    viber_subscribe.name AS viber_name,
    viber_subscribe.role AS viber_role,
    viber_subscribe.add_date AS viber_date,
    (COALESCE(telegram_actions.actions, 0) + COALESCE(viber_actions.actions, 0)) AS total_actions,
    COALESCE(requests.total_count, 0) AS requests_sent
  FROM analytic_user
  LEFT JOIN (
    SELECT analytic_user_, COUNT(1) AS total_count FROM analytic_request
    GROUP BY analytic_user_
  ) AS requests ON analytic_user.analytic_user_ = requests.analytic_user_
  LEFT JOIN telegram_subscribe ON analytic_user.phone = telegram_subscribe.mobile_phone
  LEFT JOIN viber_subscribe ON analytic_user.phone = viber_subscribe.mobile_phone
  LEFT JOIN (
    SELECT telegram_id, COUNT(1) AS actions FROM telegram_message_log
    GROUP BY telegram_id
  ) AS telegram_actions ON telegram_subscribe.telegram_id = telegram_actions.telegram_id
  LEFT JOIN (
    SELECT viber_id, COUNT(1) AS actions FROM viber_message_log
    GROUP BY viber_id
  ) AS viber_actions ON viber_subscribe.viber_id = viber_actions.viber_id
  WHERE analytic_user.analytic_user_ = $1;
`;