import Routes from '../routes';

describe('Routes predicates', () => {
  describe('isProtectedRoute', () => {
    it('returns true for admin dashboard', () => {
      expect(Routes.isProtectedRoute(Routes.groupAdminDashboard)).toBe(true);
      expect(Routes.isProtectedRoute(Routes.courseAdminDashboard)).toBe(true);
    });

    it('returns true for investor dashboard', () => {
      expect(Routes.isProtectedRoute(Routes.groupInvestorDashboard)).toBe(true);
    });

    it('returns true for create offer', () => {
      expect(Routes.isProtectedRoute(Routes.groupCreateOffer)).toBe(true);
    });

    it('returns false for front page', () => {
      expect(Routes.isProtectedRoute(Routes.nonGroupFront)).toBe(false);
      expect(Routes.isProtectedRoute(Routes.groupFront)).toBe(false);
      expect(Routes.isProtectedRoute(Routes.courseFront)).toBe(false);
    });

    it('returns false for sign in routes', () => {
      expect(Routes.isProtectedRoute(Routes.nonGroupSignIn)).toBe(false);
      expect(Routes.isProtectedRoute(Routes.groupSignIn)).toBe(false);
      expect(Routes.isProtectedRoute(Routes.courseSignIn)).toBe(false);
      expect(Routes.isProtectedRoute(Routes.superAdminSignIn)).toBe(false);
    });

    it('returns false for sign up routes', () => {
      expect(Routes.isProtectedRoute(Routes.nonGroupSignUp)).toBe(false);
      expect(Routes.isProtectedRoute(Routes.groupSignUp)).toBe(false);
    });

    it('returns false for about/hiw/contact', () => {
      expect(Routes.isProtectedRoute(Routes.nonGroupAbout)).toBe(false);
      expect(Routes.isProtectedRoute(Routes.nonGroupHiw)).toBe(false);
      expect(Routes.isProtectedRoute(Routes.nonGroupContact)).toBe(false);
    });

    it('returns false for explore', () => {
      expect(Routes.isProtectedRoute(Routes.nonGroupExploreFront)).toBe(false);
      expect(Routes.isProtectedRoute(Routes.groupExploreFront)).toBe(false);
    });

    it('returns false for system public routes', () => {
      expect(Routes.isProtectedRoute(Routes.nonGroupPrivacyPolicy)).toBe(false);
      expect(Routes.isProtectedRoute(Routes.nonGroupTermsOfUse)).toBe(false);
    });

    it('returns false for error route', () => {
      expect(Routes.isProtectedRoute(Routes.error404)).toBe(false);
    });

    it('returns false for public view offer routes', () => {
      expect(Routes.isProtectedRoute(Routes.nonGroupViewOffer)).toBe(false);
      expect(Routes.isProtectedRoute(Routes.groupViewOffer)).toBe(false);
      expect(Routes.isProtectedRoute(Routes.courseViewOffer)).toBe(false);
    });
  });

  describe('isRouteReservedForSuperAdmin', () => {
    it('returns true for non-group admin dashboard', () => {
      expect(Routes.isRouteReservedForSuperAdmin(Routes.nonGroupAdminDashboard)).toBe(true);
    });

    it('returns true for non-group view profile', () => {
      expect(Routes.isRouteReservedForSuperAdmin(Routes.nonGroupViewUserProfile)).toBe(true);
    });

    it('returns false for group admin dashboard', () => {
      expect(Routes.isRouteReservedForSuperAdmin(Routes.groupAdminDashboard)).toBe(false);
    });
  });

  describe('isGroupAdminRoute', () => {
    it('returns true for group admin dashboard', () => {
      expect(Routes.isGroupAdminRoute(Routes.groupAdminDashboard)).toBe(true);
    });

    it('returns true for course admin dashboard', () => {
      expect(Routes.isGroupAdminRoute(Routes.courseAdminDashboard)).toBe(true);
    });

    it('returns false for non-admin routes', () => {
      expect(Routes.isGroupAdminRoute(Routes.groupFront)).toBe(false);
    });
  });

  describe('isIssuerDashboardRoute', () => {
    it('returns true for all issuer dashboard variants', () => {
      expect(Routes.isIssuerDashboardRoute(Routes.nonGroupIssuerDashboard)).toBe(true);
      expect(Routes.isIssuerDashboardRoute(Routes.groupIssuerDashboard)).toBe(true);
      expect(Routes.isIssuerDashboardRoute(Routes.courseIssuerDashboard)).toBe(true);
    });

    it('returns false for investor dashboard', () => {
      expect(Routes.isIssuerDashboardRoute(Routes.groupInvestorDashboard)).toBe(false);
    });
  });

  describe('isInvestorDashboardRoute', () => {
    it('returns true for all investor dashboard variants', () => {
      expect(Routes.isInvestorDashboardRoute(Routes.nonGroupInvestorDashboard)).toBe(true);
      expect(Routes.isInvestorDashboardRoute(Routes.groupInvestorDashboard)).toBe(true);
      expect(Routes.isInvestorDashboardRoute(Routes.courseInvestorDashboard)).toBe(true);
    });
  });

  describe('isCreateOfferRoute', () => {
    it('returns true for all create offer variants', () => {
      expect(Routes.isCreateOfferRoute(Routes.nonGroupCreateOffer)).toBe(true);
      expect(Routes.isCreateOfferRoute(Routes.groupCreateOffer)).toBe(true);
      expect(Routes.isCreateOfferRoute(Routes.courseCreateOffer)).toBe(true);
    });
  });

  describe('isSignInRoute', () => {
    it('returns true for all sign in variants', () => {
      expect(Routes.isSignInRoute(Routes.nonGroupSignIn)).toBe(true);
      expect(Routes.isSignInRoute(Routes.groupSignIn)).toBe(true);
      expect(Routes.isSignInRoute(Routes.courseSignIn)).toBe(true);
      expect(Routes.isSignInRoute(Routes.superAdminSignIn)).toBe(true);
    });
  });

  describe('isSuperAdminSignInRoute', () => {
    it('returns true only for super admin sign in', () => {
      expect(Routes.isSuperAdminSignInRoute(Routes.superAdminSignIn)).toBe(true);
      expect(Routes.isSuperAdminSignInRoute(Routes.groupSignIn)).toBe(false);
    });
  });

  describe('isSignUpRoute', () => {
    it('returns true for all sign up variants', () => {
      expect(Routes.isSignUpRoute(Routes.nonGroupSignUp)).toBe(true);
      expect(Routes.isSignUpRoute(Routes.groupSignUp)).toBe(true);
      expect(Routes.isSignUpRoute(Routes.courseSignUp)).toBe(true);
    });
  });

  describe('isErrorRoute', () => {
    it('returns true for error404', () => {
      expect(Routes.isErrorRoute(Routes.error404)).toBe(true);
    });

    it('returns false for other routes', () => {
      expect(Routes.isErrorRoute(Routes.nonGroupFront)).toBe(false);
    });
  });

  describe('isSystemPublicRoute', () => {
    it('returns true for privacy policy', () => {
      expect(Routes.isSystemPublicRoute(Routes.nonGroupPrivacyPolicy)).toBe(true);
    });

    it('returns true for terms of use', () => {
      expect(Routes.isSystemPublicRoute(Routes.nonGroupTermsOfUse)).toBe(true);
    });

    it('returns true for risk warning', () => {
      expect(Routes.isSystemPublicRoute(Routes.nonGroupRiskWarning)).toBe(true);
    });

    it('returns true for create pitch T&Cs', () => {
      expect(Routes.isSystemPublicRoute(Routes.nonGroupCreatePitchTermsAndConditions)).toBe(true);
    });

    it('returns true for marketing preferences', () => {
      expect(Routes.isSystemPublicRoute(Routes.nonGroupMarketingPreferences)).toBe(true);
    });

    it('returns false for non-system routes', () => {
      expect(Routes.isSystemPublicRoute(Routes.nonGroupFront)).toBe(false);
    });
  });
});

describe('Route construction', () => {
  describe('constructSignInRoute', () => {
    it('returns course sign in when both params present', () => {
      const route = Routes.constructSignInRoute({
        groupUserName: 'test-uni',
        courseUserName: 'cs-msc',
      });
      expect(route).toBe('/groups/test-uni/cs-msc/signin');
    });

    it('returns course sign in with default course when only group present', () => {
      const route = Routes.constructSignInRoute({ groupUserName: 'test-uni' });
      expect(route).toBe('/groups/test-uni/student-showcase/signin');
    });

    it('returns non-group sign in when no params', () => {
      const route = Routes.constructSignInRoute({});
      expect(route).toBe(Routes.nonGroupSignIn);
    });
  });

  describe('constructSignUpRoute', () => {
    it('builds course sign up with both params', () => {
      const route = Routes.constructSignUpRoute('test-uni', undefined, 'cs-msc');
      expect(route).toBe('/groups/test-uni/cs-msc/signup');
    });

    it('builds course sign up with invited user ID', () => {
      const route = Routes.constructSignUpRoute('test-uni', 'inv-123', 'cs-msc');
      expect(route).toContain('inv-123');
    });

    it('builds group sign up when no course', () => {
      const route = Routes.constructSignUpRoute('test-uni');
      expect(route).toBe('/groups/test-uni/signup');
    });

    it('returns non-group sign up for empty group', () => {
      const route = Routes.constructSignUpRoute('');
      expect(route).toBe(Routes.nonGroupSignUp);
    });
  });

  describe('constructProjectDetailRoute', () => {
    it('builds course project URL', () => {
      const route = Routes.constructProjectDetailRoute('test-uni', 'cs-msc', 'proj-1');
      expect(route).toBe('/groups/test-uni/cs-msc/projects/proj-1');
    });

    it('builds group project URL', () => {
      const route = Routes.constructProjectDetailRoute('test-uni', null, 'proj-1');
      expect(route).toBe('/groups/test-uni/projects/proj-1');
    });

    it('builds non-group project URL', () => {
      const route = Routes.constructProjectDetailRoute(null, null, 'proj-1');
      expect(route).toBe('/projects/proj-1');
    });
  });

  describe('constructCreateProjectRoute', () => {
    it('builds course create offer URL', () => {
      const route = Routes.constructCreateProjectRoute('test-uni', 'cs-msc');
      expect(route).toBe('/groups/test-uni/cs-msc/create-offer');
    });

    it('builds group create offer URL', () => {
      const route = Routes.constructCreateProjectRoute('test-uni');
      expect(route).toBe('/groups/test-uni/create-offer');
    });

    it('adds edit query param', () => {
      const route = Routes.constructCreateProjectRoute('test-uni', null, { edit: 'proj-1' });
      expect(route).toContain('?edit=proj-1');
    });

    it('adds admin and issuer query params', () => {
      const route = Routes.constructCreateProjectRoute('test-uni', null, {
        admin: 'admin-1',
        issuer: 'issuer-1',
      });
      expect(route).toContain('?admin=admin-1&issuer=issuer-1');
    });
  });

  describe('constructGroupDetailRoute', () => {
    it('builds course group detail URL', () => {
      const route = Routes.constructGroupDetailRoute('test-uni', 'cs-msc', 'viewed-group');
      expect(route).toBe('/groups/test-uni/cs-msc/view-group-details/viewed-group');
    });

    it('builds group group detail URL', () => {
      const route = Routes.constructGroupDetailRoute('test-uni', null, 'viewed-group');
      expect(route).toBe('/groups/test-uni/view-group-details/viewed-group');
    });

    it('builds non-group group detail URL', () => {
      const route = Routes.constructGroupDetailRoute(null, null, 'viewed-group');
      expect(route).toBe('/view-group-details/viewed-group');
    });
  });

  describe('constructAboutRoute', () => {
    it('returns course about with both params', () => {
      const route = Routes.constructAboutRoute({
        groupUserName: 'test-uni',
        courseUserName: 'cs-msc',
      });
      expect(route).toBe('/groups/test-uni/cs-msc/about');
    });

    it('returns group about with only group param', () => {
      const route = Routes.constructAboutRoute({ groupUserName: 'test-uni' });
      expect(route).toBe('/groups/test-uni/about');
    });

    it('defaults to invest-west/student-showcase when no params', () => {
      const route = Routes.constructAboutRoute({});
      expect(route).toBe('/groups/invest-west/student-showcase/about');
    });
  });

  describe('constructHiwRoute', () => {
    it('returns course HIW with both params', () => {
      const route = Routes.constructHiwRoute({
        groupUserName: 'test-uni',
        courseUserName: 'cs-msc',
      });
      expect(route).toBe('/groups/test-uni/cs-msc/Hiw');
    });

    it('defaults to invest-west/student-showcase when no params', () => {
      const route = Routes.constructHiwRoute({});
      expect(route).toBe('/groups/invest-west/student-showcase/Hiw');
    });
  });

  describe('constructContactRoute', () => {
    it('returns course contact with both params', () => {
      const route = Routes.constructContactRoute({
        groupUserName: 'test-uni',
        courseUserName: 'cs-msc',
      });
      expect(route).toBe('/groups/test-uni/cs-msc/contact-us-front');
    });

    it('defaults to invest-west/student-showcase when no params', () => {
      const route = Routes.constructContactRoute({});
      expect(route).toBe('/groups/invest-west/student-showcase/contact-us-front');
    });
  });

  describe('constructExploreRoute', () => {
    it('returns course explore with both params', () => {
      const route = Routes.constructExploreRoute({
        groupUserName: 'test-uni',
        courseUserName: 'cs-msc',
      });
      expect(route).toBe('/groups/test-uni/cs-msc/explore');
    });

    it('returns group explore with only group', () => {
      const route = Routes.constructExploreRoute({ groupUserName: 'test-uni' });
      expect(route).toBe('/groups/test-uni/explore');
    });

    it('defaults to invest-west/student-showcase when no params', () => {
      const route = Routes.constructExploreRoute({});
      expect(route).toBe('/groups/invest-west/student-showcase/explore');
    });
  });

  describe('constructPublicRoute', () => {
    it('returns privacy policy route', () => {
      expect(Routes.constructPublicRoute('privacyPolicy')).toBe('/privacy-policy');
    });

    it('returns terms of use route', () => {
      expect(Routes.constructPublicRoute('termsOfUse')).toBe('/terms-of-use');
    });

    it('returns risk warning route', () => {
      expect(Routes.constructPublicRoute('riskWarning')).toBe('/risk-warning-footer');
    });
  });
});
